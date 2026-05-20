import type { Address } from 'viem';
import type { UserProfile } from '../circles/profile';

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
  reactions?: MessageReactionsSummary;
};

export type ChatMessage = StoredMessage & {
  profile: UserProfile | null;
};

export type ReactionBuildResponse =
  | {
      paymentData: string;
      transactions: Array<{
        to: string;
        data?: string;
        value?: string;
      }>;
    }
  | {
      status: 'ready';
      reaction: {
        key: string;
        messageId: string;
        reactionAuthor: Address;
        timestamp: number;
        emoji: string;
      };
      recovered?: boolean;
    };

export type ReactionConfirmResponse =
  | { status: 'pending' }
  | { status: 'expired' }
  | {
      status: 'ready';
      reaction: {
        key: string;
        messageId: string;
        reactionAuthor: Address;
        timestamp: number;
        emoji: string;
      };
    };
