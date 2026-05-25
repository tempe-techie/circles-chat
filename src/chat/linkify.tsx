import type { ReactNode } from 'react';

const URL_RE =
  /https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+/gi;

type Segment =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string; href: string };

function splitTrailingPunctuation(raw: string): { url: string; trailing: string } {
  let url = raw;
  let trailing = '';
  const punctMatch = url.match(/[.,;:!?]+$/);
  if (punctMatch) {
    url = url.slice(0, -punctMatch[0].length);
    trailing = punctMatch[0];
  }
  if (url.endsWith(')') && !url.includes('(')) {
    url = url.slice(0, -1);
    trailing = `)${trailing}`;
  }
  return { url, trailing };
}

function hrefForUrl(raw: string): string | null {
  const candidate = /^www\./i.test(raw) ? `https://${raw}` : raw;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function linkifySegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_RE)) {
    const start = match.index ?? 0;
    const raw = match[0];

    if (start > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, start) });
    }

    const { url, trailing } = splitTrailingPunctuation(raw);
    const href = hrefForUrl(url);

    if (href) {
      segments.push({ type: 'link', value: url, href });
      if (trailing) {
        segments.push({ type: 'text', value: trailing });
      }
    } else {
      segments.push({ type: 'text', value: raw });
    }

    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}

export function LinkifiedText({ text }: { text: string }): ReactNode {
  const segments = linkifySegments(text);

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === 'link' ? (
          <a
            key={index}
            href={segment.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 underline hover:text-emerald-300 break-all"
          >
            {segment.value}
          </a>
        ) : (
          <span key={index}>{segment.value}</span>
        ),
      )}
    </>
  );
}
