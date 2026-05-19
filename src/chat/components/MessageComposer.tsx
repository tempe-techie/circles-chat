import { useState } from 'react';
import { MAX_MESSAGE_LENGTH } from '../constants';

export function MessageComposer({
  placeholder,
  disabled,
  submitting,
  onSubmit,
}: {
  placeholder: string;
  disabled?: boolean;
  submitting?: boolean;
  onSubmit: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled || submitting) return;

    setError(null);
    try {
      await onSubmit(trimmed);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || submitting}
          rows={2}
          maxLength={MAX_MESSAGE_LENGTH}
          className="min-w-0 flex-1 resize-none rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-emerald-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || submitting || !text.trim()}
          className="shrink-0 self-end rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {submitting ? '…' : 'Send'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
