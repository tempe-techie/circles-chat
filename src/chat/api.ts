import { MAX_MESSAGE_LENGTH } from './constants';
import type {
  ReactionBuildResponse,
  StoredMessage,
  TipBuildResponse,
} from './types';

export type MessagesPage = {
  messages: StoredMessage[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type PostMessageGroup = {
  address: string;
  channelName: string;
};

export type PostMessageTarget =
  | { kind: 'group'; address: string; channelName: string }
  | { kind: 'profile'; address: string; name: string };

/** Thrown when the server rejects a request because the session is missing or expired. */
export class SessionRequiredError extends Error {
  constructor(message = 'Verification required') {
    super(message);
    this.name = 'SessionRequiredError';
  }
}

export async function registerSession(
  address: string,
  sessionKey: string,
  signature: string,
): Promise<void> {
  const res = await fetch('/api/chat/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, sessionKey, signature }),
  });

  const data = (await res.json()) as { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to verify');
  }
}

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
  groupAddress?: string,
  profileAddress?: string,
): Promise<MessagesPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set('cursor', cursor);
  }
  if (viewer) {
    params.set('viewer', viewer);
  }
  if (groupAddress) {
    params.set('groupAddress', groupAddress);
  }
  if (profileAddress) {
    params.set('profileAddress', profileAddress);
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
  sessionKey: string,
  target?: PostMessageTarget,
): Promise<StoredMessage> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty');
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message must be at most ${MAX_MESSAGE_LENGTH} characters`);
  }

  const body: Record<string, unknown> = {
    author,
    text: trimmed,
    timestamp: Math.floor(Date.now() / 1000),
    sessionKey,
  };

  if (target?.kind === 'group') {
    body.groupAddress = target.address;
    body.groupName = target.channelName;
  } else if (target?.kind === 'profile') {
    body.profileAddress = target.address;
    body.profileName = target.name;
  }

  const res = await fetch('/api/chat/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as StoredMessage & {
    error?: string;
    code?: string;
  };

  if (!res.ok) {
    if (res.status === 401 && data.code === 'SESSION_REQUIRED') {
      throw new SessionRequiredError(data.error);
    }
    throw new Error(data.error ?? 'Failed to post message');
  }

  return data;
}

export async function deleteMessage(
  key: string,
  actor: string,
  sessionKey: string,
): Promise<void> {
  const res = await fetch(`/api/chat/messages/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor, sessionKey }),
  });

  const data = (await res.json()) as { error?: string; code?: string };

  if (!res.ok) {
    if (res.status === 401 && data.code === 'SESSION_REQUIRED') {
      throw new SessionRequiredError(data.error);
    }
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

export async function buildTip(
  sender: string,
  recipient: string,
  amount: number,
): Promise<TipBuildResponse> {
  const res = await fetch('/api/chat/tips/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender, recipient, amount }),
  });

  const data = (await res.json()) as TipBuildResponse & {
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to build tip payment');
  }

  return data;
}
