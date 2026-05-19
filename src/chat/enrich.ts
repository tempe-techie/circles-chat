import { getAddress } from 'viem';
import { fetchUserProfile } from '../circles/profile';
import { fetchMessageBody } from './arweave';
import type { ChainMessage, ChatMessage } from './types';

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

export async function enrichChainMessage(
  chain: ChainMessage,
): Promise<ChatMessage> {
  try {
    const [body, profile] = await Promise.all([
      fetchMessageBody(chain.url),
      cachedProfile(chain.author),
    ]);
    return { chain, body, profile };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load message';
    return {
      chain,
      body: null,
      profile: await cachedProfile(chain.author).catch(() => null),
      loadError: message,
    };
  }
}

export async function enrichChainMessages(
  messages: ChainMessage[],
): Promise<ChatMessage[]> {
  return Promise.all(messages.map(enrichChainMessage));
}
