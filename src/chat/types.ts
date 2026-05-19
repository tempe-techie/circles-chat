import type { Address } from 'viem';
import type { UserProfile } from '../circles/profile';

export type StoredMessage = {
  key: string;
  author: Address;
  text: string;
  timestamp: number;
};

export type ChatMessage = StoredMessage & {
  profile: UserProfile | null;
};
