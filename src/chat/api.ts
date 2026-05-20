import { MAX_MESSAGE_LENGTH } from './constants';
import type { ReactionBuildResponse, StoredMessage } from './types';

export type MessagesPage = {
  messages: StoredMessage[];
  nextCursor: string | null;
  hasMore: boolean;
};

export async function fetchModerators(): Promise<string[]> {
  const res = await fetch('/api/chat/moderators');
  const data = (await res.json()) as { moderators?: string[]; error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to load moderators');
  }

  return data.moderators ?? [];
}

export async function fetchMessages(
  limit: number,
  cursor?: string,
  viewer?: string,
): Promise<MessagesPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set('cursor', cursor);
  }
  if (viewer) {
    params.set('viewer', viewer);
  }

  const res = await fetch(`/api/chat/messages?${params}`);
  const data = (await res.json()) as MessagesPage & { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to load messages');
  }

  return {
    messages: data.messages ?? [],
    nextCursor: data.nextCursor ?? null,
    hasMore: Boolean(data.hasMore),
  };
}

export async function postMessage(
  author: string,
  text: string,
): Promise<StoredMessage> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty');
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message must be at most ${MAX_MESSAGE_LENGTH} characters`);
  }

  const res = await fetch('/api/chat/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author,
      text: trimmed,
      timestamp: Math.floor(Date.now() / 1000),
    }),
  });

  const data = (await res.json()) as StoredMessage & { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to post message');
  }

  return data;
}

export async function deleteMessage(
  key: string,
  signature: string,
): Promise<void> {
  const res = await fetch(`/api/chat/messages/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signature }),
  });

  const data = (await res.json()) as { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to delete message');
  }
}

export async function buildMessageReaction(
  messageKey: string,
  reactor: string,
): Promise<ReactionBuildResponse> {
  const res = await fetch(
    `/api/chat/messages/${encodeURIComponent(messageKey)}/reactions/build`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactor }),
    },
  );

  const data = (await res.json()) as ReactionBuildResponse & {
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to build reaction payment');
  }

  return data;
}
