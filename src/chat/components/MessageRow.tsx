import { getAddress } from 'viem';
import { formatRelativeTime, shortenAddress } from '../format';
import type { ChatMessage } from '../types';
import { MessageAvatar } from './MessageAvatar';

export function displayNameFor(message: ChatMessage): string {
  if (message.profile?.name) return message.profile.name;
  try {
    return shortenAddress(getAddress(message.chain.author));
  } catch {
    return shortenAddress(message.chain.author);
  }
}

export function MessageRow({
  message,
  timestamp,
  canDelete,
  deleting,
  onDelete,
  compact = false,
}: {
  message: ChatMessage;
  timestamp: number;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: () => void;
  compact?: boolean;
}) {
  const author = message.body?.author ?? message.chain.author;
  const text =
    message.loadError ??
    message.body?.text ??
    '(message unavailable)';

  return (
    <div className={`flex gap-3 ${compact ? 'py-2' : 'py-3'}`}>
      <MessageAvatar
        profile={message.profile}
        address={author}
        size={compact ? 'sm' : 'md'}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-semibold text-slate-100">
            {displayNameFor(message)}
          </span>
          <span className="text-xs text-slate-500">
            {formatRelativeTime(timestamp)}
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
        <p
          className={`mt-1 text-sm whitespace-pre-wrap break-words ${
            message.loadError ? 'text-slate-500 italic' : 'text-slate-200'
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
