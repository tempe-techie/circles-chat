import { useCallback, useEffect, useState } from 'react';
import { getAddress } from 'viem';
import {
  deleteMainMessage,
  postMainMessage,
} from '../actions';
import {
  checkIsUserMod,
  fetchLastMainMessages,
  getMainMessageCount,
} from '../client';
import { PAGE_SIZE } from '../constants';
import { enrichChainMessages } from '../enrich';
import type { ChatMessage } from '../types';
import { isMiniappMode } from '../../host/bridge';
import { MessageComposer } from './MessageComposer';
import { MessageRow } from './MessageRow';
import { ReplyThread } from './ReplyThread';

export function ChatWall({ wallet }: { wallet: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE);
  const [totalCount, setTotalCount] = useState<bigint>(0n);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isMod, setIsMod] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<bigint | null>(null);

  const inHost = isMiniappMode();
  const canPost = Boolean(wallet && inHost);

  const loadMessages = useCallback(async (count: number) => {
    const [chainMsgs, total] = await Promise.all([
      fetchLastMainMessages(count),
      getMainMessageCount(),
    ]);
    const enriched = await enrichChainMessages(chainMsgs);
    setMessages(enriched);
    setTotalCount(total);
    setLoadedCount(count);
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      await loadMessages(loadedCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat');
    }
  }, [loadMessages, loadedCount]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [chainMsgs, total] = await Promise.all([
          fetchLastMainMessages(PAGE_SIZE),
          getMainMessageCount(),
        ]);
        if (cancelled) return;
        const enriched = await enrichChainMessages(chainMsgs);
        setMessages(enriched);
        setTotalCount(total);
        setLoadedCount(PAGE_SIZE);
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

  useEffect(() => {
    if (!wallet) {
      setIsMod(false);
      return;
    }
    let cancelled = false;
    checkIsUserMod(getAddress(wallet))
      .then((mod) => {
        if (!cancelled) setIsMod(mod);
      })
      .catch(() => {
        if (!cancelled) setIsMod(false);
      });
    return () => {
      cancelled = true;
    };
  }, [wallet]);

  const loadMore = async () => {
    const next = loadedCount + PAGE_SIZE;
    setLoadingMore(true);
    setError(null);
    try {
      await loadMessages(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  };

  const canDeleteMessage = (msg: ChatMessage) => {
    if (!wallet) return false;
    try {
      const w = getAddress(wallet);
      return (
        isMod ||
        getAddress(msg.chain.author) === w ||
        Boolean(msg.body?.author && getAddress(msg.body.author) === w)
      );
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
      const total = Number(await getMainMessageCount());
      const nextCount = Math.min(Math.max(loadedCount, PAGE_SIZE), total);
      await loadMessages(nextCount || PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post message');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mainIndex: bigint) => {
    setDeletingIndex(mainIndex);
    setError(null);
    try {
      await deleteMainMessage(mainIndex);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingIndex(null);
    }
  };

  const hasMore = totalCount > BigInt(loadedCount);

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
          messages.map((msg) => {
            const ts =
              msg.body?.timestamp ?? Number(msg.chain.createdAt);
            const replyCount = Number(msg.chain.repliesCount);
            return (
              <article
                key={msg.chain.index.toString()}
                className="border-b border-slate-800/60 last:border-0"
              >
                <MessageRow
                  message={msg}
                  timestamp={ts}
                  canDelete={canDeleteMessage(msg)}
                  deleting={deletingIndex === msg.chain.index}
                  onDelete={() => handleDelete(msg.chain.index)}
                />
                <ReplyThread
                  mainMsgIndex={msg.chain.index}
                  repliesCount={replyCount}
                  wallet={wallet}
                  isMod={isMod}
                  canPost={canPost}
                  onChanged={refresh}
                />
              </article>
            );
          })}
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
