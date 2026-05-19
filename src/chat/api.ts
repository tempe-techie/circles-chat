import { MAX_MESSAGE_LENGTH } from './constants';
import type { StoredMessage } from './types';

export async function fetchMessages(
  limit: number,
  beforeKey?: string,
): Promise<StoredMessage[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (beforeKey) {
    params.set('before', beforeKey);
  }

  const res = await fetch(`/api/chat/messages?${params}`);
  const data = (await res.json()) as {
    messages?: StoredMessage[];
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to load messages');
  }

  return data.messages ?? [];
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
