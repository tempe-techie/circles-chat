import { useState, type ReactNode } from 'react';

const URL_RE =
  /https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+/gi;

const IMAGE_PATH_RE = /\.(gif|jpe?g|png|webp|avif)(\?.*)?$/i;

type Segment =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string; href: string }
  | { type: 'image'; href: string; value: string };

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

export function hrefForUrl(raw: string): string | null {
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

export function isImageUrl(href: string): boolean {
  try {
    const { pathname, hostname, search } = new URL(href);
    if (IMAGE_PATH_RE.test(pathname)) return true;

    const format = new URLSearchParams(search).get('format');
    if (format && /^(gif|jpe?g|png|webp|avif)$/i.test(format)) return true;

    if (/\.giphy\.com$/i.test(hostname) && /\/media\//i.test(pathname)) {
      return true;
    }
    if (/media\.tenor\.com$/i.test(hostname)) return true;
    if (/\.imgur\.com$/i.test(hostname) && IMAGE_PATH_RE.test(pathname)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function parseMessageSegments(text: string): Segment[] {
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
      if (isImageUrl(href)) {
        segments.push({ type: 'image', value: url, href });
      } else {
        segments.push({ type: 'link', value: url, href });
      }
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

function MessageImage({ href, label }: { href: string; label: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-400 underline hover:text-emerald-300 break-all"
      >
        {label}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-full overflow-hidden rounded-lg ring-1 ring-slate-700/60"
    >
      <img
        src={href}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="block max-w-full max-h-80 w-auto h-auto object-contain bg-slate-900/40"
      />
    </a>
  );
}

export function MessageContent({ text }: { text: string }): ReactNode {
  const segments = parseMessageSegments(text);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'link') {
          return (
            <a
              key={index}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline hover:text-emerald-300 break-all"
            >
              {segment.value}
            </a>
          );
        }
        if (segment.type === 'image') {
          return (
            <span key={index} className="my-1 block max-w-full">
              <MessageImage href={segment.href} label={segment.value} />
            </span>
          );
        }
        return <span key={index}>{segment.value}</span>;
      })}
    </>
  );
}
