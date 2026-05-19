import type { Address } from 'viem';
import type { UserProfile } from '../circles/profile';

export type ChainMessage = {
  author: Address;
  createdAt: bigint;
  deleted: boolean;
  index: bigint;
  repliesCount: bigint;
  url: string;
};

export type MessageBody = {
  author: string;
  text: string;
  timestamp: number;
};

export type ChatMessage = {
  chain: ChainMessage;
  body: MessageBody | null;
  profile: UserProfile | null;
  loadError?: string;
};
