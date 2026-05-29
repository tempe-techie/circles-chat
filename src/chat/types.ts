import type { Address } from 'viem';
import type { UserGroup } from '../circles/groups';
import type { UserProfile } from '../circles/profile';

export type { UserGroup };

export type ChatChannel =
  | { kind: 'general' }
  | {
      kind: 'group';
      address: string;
      channelName: string;
      name: string;
    };

export type MessageReactionsSummary = {
  count: number;
  reactedByMe: boolean;
  emoji: string;
};

export type StoredMessage = {
  key: string;
  author: Address;
  text: string;
  timestamp: number;
  groupAddress?: string;
  groupName?: string;
  reactions?: MessageReactionsSummary;
};

export type ChatMessage = StoredMessage & {
  profile: UserProfile | null;
};

export type TipBuildResponse = {
  status: 'ready';
  transactions: Array<{
    to: string;
    data?: string;
    value?: string;
  }>;
};

export type ReactionBuildResponse = {
  status: 'ready';
  reaction: {
    key: string;
    messageId: string;
    reactionAuthor: Address;
    timestamp: number;
    emoji: string;
  };
  transactions: Array<{
    to: string;
    data?: string;
    value?: string;
  }>;
};
