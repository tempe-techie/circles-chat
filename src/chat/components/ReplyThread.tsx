import { useCallback, useState } from 'react';
import { getAddress } from 'viem';
import {
  deleteReplyMessage,
  postReply,
} from '../actions';
import { fetchLastReplies } from '../client';
import { enrichChainMessages } from '../enrich';
import type { ChatMessage } from '../types';
import { MessageComposer } from './MessageComposer';
import { MessageRow } from './MessageRow';

export function ReplyThread({
  mainMsgIndex,
  repliesCount,
  wallet,
  isMod,
  canPost,
  onChanged,
}: {
  mainMsgIndex: bigint;
  repliesCount: number;
  wallet: string | null;
  isMod: boolean;
  canPost: boolean;
  onChanged: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<bigint | null>(null);

  const loadReplies = useCallback(async () => {
    if (repliesCount === 0) return;
    setLoading(true);
    setLoadError(null);
    try {
      const count = Math.min(repliesCount, 50);
      const chainReplies = await fetchLastReplies(mainMsgIndex, count);
      const enriched = await enrichChainMessages(chainReplies);
      setReplies(enriched);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to load replies',
      );
    } finally {
      setLoading(false);
    }
  }, [mainMsgIndex, repliesCount]);

  const toggle = async () => {
    if (!expanded && replies.length === 0 && repliesCount > 0) {
      await loadReplies();
    }
    setExpanded((v) => !v);
  };

  const canDeleteReply = (msg: ChatMessage) => {
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

  const handleDelete = async (replyIndex: bigint) => {
    setDeletingIndex(replyIndex);
    try {
      await deleteReplyMessage(mainMsgIndex, replyIndex);
      onChanged();
      if (expanded) await loadReplies();
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleReply = async (text: string) => {
    if (!wallet) return;
    setSubmitting(true);
    try {
      await postReply(wallet, mainMsgIndex, text);
      onChanged();
      await loadReplies();
      setExpanded(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (repliesCount === 0 && !canPost) return null;

  return (
    <div className="mt-1 ml-12 border-l border-slate-800 pl-4">
      <button
        type="button"
        onClick={toggle}
        className="text-xs font-medium text-emerald-500 hover:text-emerald-400"
      >
        {repliesCount > 0
          ? `${expanded ? 'Hide' : 'View'} ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}`
          : expanded
            ? 'Hide reply'
            : 'Reply'}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1">
          {loading && (
            <p className="text-xs text-slate-500">Loading replies…</p>
          )}
          {loadError && (
            <p className="text-xs text-red-400">{loadError}</p>
          )}
          {replies.map((reply) => {
            const ts = reply.body?.timestamp ?? Number(reply.chain.createdAt);
            return (
              <MessageRow
                key={`${mainMsgIndex}-${reply.chain.index}`}
                message={reply}
                timestamp={ts}
                compact
                canDelete={canDeleteReply(reply)}
                deleting={deletingIndex === reply.chain.index}
                onDelete={() => handleDelete(reply.chain.index)}
              />
            );
          })}
          {canPost && (
            <div className="pt-2">
              <MessageComposer
                placeholder="Reply in thread…"
                disabled={!wallet}
                submitting={submitting}
                onSubmit={handleReply}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
