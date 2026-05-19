import { useCallback, useEffect, useState } from 'react';
import { getAddress } from 'viem';
import { deleteMainMessage, postMainMessage } from '../actions';
import { fetchMessages } from '../api';
import { PAGE_SIZE } from '../constants';
import { enrichMessages } from '../enrich';
import type { ChatMessage } from '../types';
import { isMiniappMode } from '../../host/bridge';
import { MessageComposer } from './MessageComposer';
import { MessageRow } from './MessageRow';

export function ChatWall({ wallet }: { wallet: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const inHost = isMiniappMode();
  const canPost = Boolean(wallet && inHost);

  const loadMessages = useCallback(
    async (limit: number, beforeKey?: string, append = false) => {
      const stored = await fetchMessages(limit, beforeKey);
      const enriched = await enrichMessages(stored);
      setHasMore(stored.length === limit);
      if (append && beforeKey) {
        setMessages((prev) => [...enriched, ...prev]);
      } else {
        setMessages(enriched);
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const count = Math.max(messages.length, PAGE_SIZE);
      await loadMessages(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat');
    }
  }, [loadMessages, messages.length]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const stored = await fetchMessages(PAGE_SIZE);
        if (cancelled) return;
        const enriched = await enrichMessages(stored);
        setMessages(enriched);
        setHasMore(stored.length === PAGE_SIZE);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load chat',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = async () => {
    if (messages.length === 0) return;
    const oldestKey = messages[0]?.key;
    if (!oldestKey) return;

    setLoadingMore(true);
    setError(null);
    try {
      await loadMessages(PAGE_SIZE, oldestKey, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  };

  const canDeleteMessage = (msg: ChatMessage) => {
    if (!wallet) return false;
    try {
      return getAddress(msg.author) === getAddress(wallet);
    } catch {
      return false;
    }
  };

  const handlePost = async (text: string) => {
    if (!wallet) return;
    setSubmitting(true);
    setError(null);
    try {
      await postMainMessage(wallet, text);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post message');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (key: string) => {
    setDeletingKey(key);
    setError(null);
    try {
      await deleteMainMessage(key);
      setMessages((prev) => prev.filter((m) => m.key !== key));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <section className="flex flex-col min-h-[420px] rounded-xl bg-slate-900/50 ring-1 ring-slate-800 overflow-hidden">
      <header className="shrink-0 border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-200"># general</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Circles community chat
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[240px] max-h-[50vh]">
        {!inHost && (
          <p className="mb-3 text-xs text-amber-400/90 bg-amber-950/30 rounded-lg px-3 py-2">
            Open in the{' '}
            <a
              href="https://circles.gnosis.io/playground"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-amber-300"
            >
              Circles Playground
            </a>{' '}
            to post messages.
          </p>
        )}

        {loading && (
          <p className="text-sm text-slate-500 py-8 text-center">
            Loading messages…
          </p>
        )}

        {error && !loading && (
          <p className="text-sm text-red-400 py-2">{error}</p>
        )}

        {!loading && hasMore && (
          <div className="py-2 text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="text-xs font-medium text-emerald-500 hover:text-emerald-400 disabled:opacity-50"
            >
              {loadingMore ? 'Loading…' : 'Load older messages'}
            </button>
          </div>
        )}

        {!loading && messages.length === 0 && !error && (
          <p className="text-sm text-slate-500 py-8 text-center">
            No messages yet. Be the first to say hello.
          </p>
        )}

        {!loading &&
          messages.map((msg) => (
            <article
              key={msg.key}
              className="border-b border-slate-800/60 last:border-0"
            >
              <MessageRow
                message={msg}
                canDelete={canDeleteMessage(msg)}
                deleting={deletingKey === msg.key}
                onDelete={() => handleDelete(msg.key)}
              />
            </article>
          ))}
      </div>

      <footer className="shrink-0 border-t border-slate-800 p-4">
        <MessageComposer
          placeholder={
            canPost
              ? 'Message #general'
              : wallet
                ? 'Connect via Circles host to post'
                : 'Connect wallet to post'
          }
          disabled={!canPost}
          submitting={submitting}
          onSubmit={handlePost}
        />
      </footer>
    </section>
  );
}
