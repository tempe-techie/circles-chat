import { getAddress } from 'viem';
import { formatRelativeTime, shortenAddress } from '../format';
import { LinkifiedText } from '../linkify';
import type { ChatMessage } from '../types';
import { MessageAvatar } from './MessageAvatar';
import { MessageReactions } from './MessageReactions';

export function displayNameFor(message: ChatMessage): string {
  if (message.profile?.name) return message.profile.name;
  try {
    return shortenAddress(getAddress(message.author));
  } catch {
    return shortenAddress(message.author);
  }
}

export function MessageRow({
  message,
  canDelete,
  deleting,
  onDelete,
  canReact,
  reacting,
  onReact,
}: {
  message: ChatMessage;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: () => void;
  canReact?: boolean;
  reacting?: boolean;
  onReact?: () => void;
}) {
  return (
    <div className="flex gap-3 py-3">
      <MessageAvatar
        profile={message.profile}
        address={message.author}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-semibold text-slate-100">
            {displayNameFor(message)}
          </span>
          <span className="text-xs text-slate-500">
            {formatRelativeTime(message.timestamp)}
          </span>
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="text-xs text-red-400/80 hover:text-red-400 disabled:opacity-50 ml-auto"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
        <p className="mt-1 text-sm whitespace-pre-wrap break-words text-slate-200">
          <LinkifiedText text={message.text} />
        </p>
        {onReact && (
          <MessageReactions
            message={message}
            canReact={Boolean(canReact)}
            reacting={Boolean(reacting)}
            onReact={onReact}
          />
        )}
      </div>
    </div>
  );
}
