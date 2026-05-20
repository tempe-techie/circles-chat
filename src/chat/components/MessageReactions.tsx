import { REACTION_CRC_COST } from '../constants';
import type { ChatMessage } from '../types';

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-rose-400"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-slate-400"
      aria-hidden
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );
}

export function MessageReactions({
  message,
  canReact,
  reacting,
  onReact,
}: {
  message: ChatMessage;
  canReact: boolean;
  reacting: boolean;
  onReact: () => void;
}) {
  const summary = message.reactions ?? {
    count: 0,
    reactedByMe: false,
    emoji: '❤️',
  };
  const filled = summary.reactedByMe;

  return (
    <div className="mt-2 flex items-center gap-1.5">
      <button
        type="button"
        onClick={onReact}
        disabled={!canReact || reacting || filled}
        title={
          filled
            ? 'You reacted to this message'
            : canReact
              ? `React with ${summary.emoji} (${REACTION_CRC_COST} CRC)`
              : 'Connect via Circles host to react'
        }
        className="inline-flex items-center gap-1 rounded-md py-0.5 text-xs text-slate-400 hover:bg-slate-800/80 hover:text-rose-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
        aria-label={
          filled
            ? `You reacted. ${summary.count} reactions`
            : `React. ${summary.count} reactions`
        }
      >
        <HeartIcon filled={filled} />
        {summary.count > 0 && (
          <span className="tabular-nums text-slate-400">{summary.count}</span>
        )}
      </button>
    </div>
  );
}
