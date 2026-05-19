import { getAddress } from 'viem';
import { fetchUserProfile } from '../circles/profile';
import type { ChatMessage, StoredMessage } from './types';

const profileCache = new Map<string, ReturnType<typeof fetchUserProfile>>();

function cachedProfile(address: string) {
  const key = getAddress(address);
  let pending = profileCache.get(key);
  if (!pending) {
    pending = fetchUserProfile(key);
    profileCache.set(key, pending);
  }
  return pending;
}

export async function enrichMessage(
  message: StoredMessage,
): Promise<ChatMessage> {
  const profile = await cachedProfile(message.author).catch(() => null);
  return { ...message, profile };
}

export async function enrichMessages(
  messages: StoredMessage[],
): Promise<ChatMessage[]> {
  return Promise.all(messages.map(enrichMessage));
}
