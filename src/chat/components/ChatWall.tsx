import { useCallback, useEffect, useRef, useState } from 'react';
import { getAddress } from 'viem';
import { deleteMainMessage, postMainMessage, reactToMessage } from '../actions';
import { fetchMessages, fetchModerators } from '../api';
import { PAGE_SIZE, REACTION_CRC_COST } from '../constants';
import { enrichMessages } from '../enrich';
import type { ChatMessage } from '../types';
import { fetchMaxFlowCrc, fetchUserCrcBalance, formatCrcBalance } from '../../circles/balance';
import { isMiniappMode } from '../../host/bridge';
import { ConfirmDialog } from './ConfirmDialog';
import { MessageComposer } from './MessageComposer';
import { MessageRow, displayNameFor } from './MessageRow';

export function ChatWall({ wallet }: { wallet: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [reactingKey, setReactingKey] = useState<string | null>(null);
  const [reactConfirmMessage, setReactConfirmMessage] =
    useState<ChatMessage | null>(null);
  const [crcBalance, setCrcBalance] = useState<number | null>(null);
  const [crcBalanceLoading, setCrcBalanceLoading] = useState(false);
  const [maxFlow, setMaxFlow] = useState<number | null>(null);
  const [maxFlowLoading, setMaxFlowLoading] = useState(false);
  const [reactModalError, setReactModalError] = useState<string | null>(null);
  const [moderatorAddresses, setModeratorAddresses] = useState<Set<string>>(
    () => new Set(),
  );

  const listRef = useRef<HTMLDivElement>(null);
  const skipScrollToBottomRef = useRef(false);
  const nextCursorRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const inHost = isMiniappMode();
  const canPost = Boolean(wallet && inHost);

  const loadMessages = useCallback(
    async (limit: number, cursor?: string, append = false) => {
      const page = await fetchMessages(limit, cursor, wallet ?? undefined);
      const enriched = await enrichMessages(page.messages);
      nextCursorRef.current = page.nextCursor;
      setHasMore(page.hasMore);
      if (append && cursor) {
        setMessages((prev) => [...enriched, ...prev]);
      } else {
        setMessages(enriched);
      }
    },
    [wallet],
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

  const refreshCrcBalance = useCallback(
    async (address: string, { silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setCrcBalanceLoading(true);
      try {
        const balance = await fetchUserCrcBalance(address);
        setCrcBalance(balance);
        return balance;
      } catch (err) {
        if (!silent) {
          setCrcBalance(null);
          setReactModalError(
            err instanceof Error ? err.message : 'Could not load CRC balance',
          );
        }
        return null;
      } finally {
        if (!silent) setCrcBalanceLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [page, moderators] = await Promise.all([
          fetchMessages(PAGE_SIZE, undefined, wallet ?? undefined),
          fetchModerators(),
        ]);
        if (cancelled) return;
        const enriched = await enrichMessages(page.messages);
        nextCursorRef.current = page.nextCursor;
        setMessages(enriched);
        setHasMore(page.hasMore);
        setModeratorAddresses(
          new Set(moderators.map((a) => getAddress(a))),
        );
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
  }, [wallet]);

  useEffect(() => {
    if (!wallet || !inHost) {
      setCrcBalance(null);
      return;
    }

    void refreshCrcBalance(wallet, { silent: true });
  }, [wallet, inHost, refreshCrcBalance]);

  useEffect(() => {
    if (loading || messages.length === 0) return;
    if (skipScrollToBottomRef.current) {
      skipScrollToBottomRef.current = false;
      return;
    }
    requestAnimationFrame(() => scrollToBottom());
  }, [loading, messages, scrollToBottom]);

  const loadMore = async () => {
    const cursor = nextCursorRef.current;
    if (!cursor) return;

    setLoadingMore(true);
    setError(null);
    skipScrollToBottomRef.current = true;
    try {
      await loadMessages(PAGE_SIZE, cursor, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  };

  const canDeleteMessage = (msg: ChatMessage) => {
    if (!wallet) return false;
    try {
      const me = getAddress(wallet);
      if (getAddress(msg.author) === me) return true;
      return moderatorAddresses.has(me);
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

  const canReactToMessage = (msg: ChatMessage) => {
    if (!wallet || !inHost) return false;
    try {
      return getAddress(msg.author) !== getAddress(wallet);
    } catch {
      return false;
    }
  };

  const handleReact = (msg: ChatMessage) => {
    if (!wallet) return;
    if (msg.reactions?.reactedByMe) return;

    setReactModalError(null);
    setReactConfirmMessage(msg);

    if (crcBalance !== null) {
      void refreshCrcBalance(wallet, { silent: true });
    } else {
      void refreshCrcBalance(wallet);
    }

    setMaxFlow(null);
    setMaxFlowLoading(true);
    const requestedAddress = wallet;
    const requestedMessage = msg;
    void fetchMaxFlowCrc(wallet, msg.author)
      .then((flow) => {
        if (
          requestedAddress === wallet &&
          requestedMessage.key === msg.key
        ) {
          setMaxFlow(flow);
        }
      })
      .catch((err) => {
        if (
          requestedAddress === wallet &&
          requestedMessage.key === msg.key
        ) {
          setReactModalError(
            err instanceof Error
              ? err.message
              : 'Could not check if a transfer path exists',
          );
        }
      })
      .finally(() => {
        setMaxFlowLoading(false);
      });
  };

  const hasEnoughBalance =
    crcBalance !== null && crcBalance >= REACTION_CRC_COST;
  const hasTransferPath =
    maxFlow !== null && maxFlow >= REACTION_CRC_COST;
  const canAffordReaction = hasEnoughBalance && hasTransferPath;
  const checkingEligibility = crcBalanceLoading || maxFlowLoading;

  let reactEligibilityError: string | null = null;
  if (!checkingEligibility) {
    if (crcBalance !== null && !hasEnoughBalance) {
      reactEligibilityError = `Your balance is ${formatCrcBalance(crcBalance)} CRC. You need at least ${REACTION_CRC_COST} CRC to react.`;
    } else if (maxFlow !== null && !hasTransferPath) {
      const recipientName = reactConfirmMessage
        ? displayNameFor(reactConfirmMessage)
        : 'this user';
      reactEligibilityError = `You can only send up to ${formatCrcBalance(maxFlow)} CRC to ${recipientName} right now. Reactions require ${REACTION_CRC_COST} CRC.`;
    }
  }

  const reactModalDescription = reactConfirmMessage
    ? [
        `Liking this message includes a ${REACTION_CRC_COST} CRC tip to ${displayNameFor(reactConfirmMessage)}.`,
        checkingEligibility
          ? 'Checking how much CRC you can send…'
          : crcBalance !== null
            ? `Your balance: ${formatCrcBalance(crcBalance)} CRC`
            : null,
      ]
        .filter(Boolean)
        .join('\n\n')
    : '';

  const confirmReact = async () => {
    const msg = reactConfirmMessage;
    if (!wallet || !msg || checkingEligibility || !canAffordReaction) return;

    setReactingKey(msg.key);
    setReactModalError(null);
    try {
      await reactToMessage(msg.key, wallet);
      setReactConfirmMessage(null);
      void refreshCrcBalance(wallet, { silent: true });
      await refresh();
    } catch (err) {
      setReactModalError(
        err instanceof Error ? err.message : 'Failed to react',
      );
    } finally {
      setReactingKey(null);
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
    <>
    <ConfirmDialog
      open={reactConfirmMessage !== null}
      title="Like message and tip the author?"
      description={reactModalDescription}
      confirmLabel={`Like & tip (${REACTION_CRC_COST} CRC)`}
      loading={checkingEligibility}
      confirmDisabled={!canAffordReaction}
      error={reactModalError ?? reactEligibilityError}
      confirming={reactConfirmMessage !== null && reactingKey === reactConfirmMessage.key}
      onConfirm={confirmReact}
      onCancel={() => {
        if (reactingKey === reactConfirmMessage?.key) return;
        setReactConfirmMessage(null);
      }}
    />
    <section className="flex flex-col min-h-[420px] rounded-xl bg-slate-900/50 ring-1 ring-slate-800 overflow-hidden">
      <header className="shrink-0 border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-200"># general</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Circles community chat
        </p>
      </header>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-2 min-h-[240px] max-h-[50vh]"
      >
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
                canReact={canReactToMessage(msg)}
                reacting={reactingKey === msg.key}
                onReact={() => handleReact(msg)}
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
    </>
  );
}
