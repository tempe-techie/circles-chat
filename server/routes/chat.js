import { Router } from 'express';
import { getAddress, isAddress } from 'viem';
import {
  authorFromKey,
  deleteMessage,
  getMessage,
  listMessages,
  saveMessage,
} from '../datastore/messages.js';
import { getModeratorAddresses, isModerator } from '../datastore/moderators.js';
import {
  getReaction,
  listReactionsForMessages,
  saveReaction,
} from '../datastore/reactions.js';
import { recoverSignerAddress, verifyAuthorSignature } from '../utils/chain.js';
import { buildReactionTransfer } from '../utils/reaction-payment.js';

const router = Router();

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function deleteSignPayload(messageKey) {
  return `circles-chat:delete:${messageKey}`;
}

router.get('/moderators', (_req, res) => {
  return res.json({ moderators: getModeratorAddresses() });
});

router.get('/messages', async (req, res) => {
  try {
    const limitRaw = req.query.limit;
    let limit = DEFAULT_LIMIT;
    if (limitRaw != null) {
      const parsed = Number(limitRaw);
      if (!Number.isFinite(parsed) || parsed < 1) {
        return res.status(400).json({ error: 'limit must be a positive number' });
      }
      limit = Math.min(Math.floor(parsed), MAX_LIMIT);
    }

    const cursor =
      typeof req.query.cursor === 'string' && req.query.cursor.trim()
        ? req.query.cursor.trim()
        : undefined;

    const viewer =
      typeof req.query.viewer === 'string' && req.query.viewer.trim()
        ? req.query.viewer.trim()
        : undefined;

    const { messages, nextCursor, hasMore } = await listMessages({
      limit,
      cursor,
    });

    const reactionSummaries = await listReactionsForMessages(
      messages.map((m) => m.key),
      viewer,
    );

    const messagesWithReactions = messages.map((message) => ({
      ...message,
      reactions: reactionSummaries.get(message.key) ?? {
        count: 0,
        reactedByMe: false,
        emoji: '❤️',
      },
    }));

    return res.json({
      messages: messagesWithReactions,
      nextCursor,
      hasMore,
    });
  } catch (err) {
    console.error('Chat list error:', err);
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { author, text, timestamp } = req.body ?? {};

    if (!author || typeof author !== 'string' || !isAddress(author)) {
      return res.status(400).json({ error: 'Invalid author address' });
    }

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const ts =
      typeof timestamp === 'number'
        ? timestamp
        : typeof timestamp === 'string'
          ? Number(timestamp)
          : Math.floor(Date.now() / 1000);

    if (!Number.isFinite(ts)) {
      return res.status(400).json({ error: 'timestamp must be a number' });
    }

    const message = await saveMessage({
      author: getAddress(author),
      text,
      timestamp: ts,
    });

    return res.json(message);
  } catch (err) {
    console.error('Chat post error:', err);
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

router.delete('/messages/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { signature } = req.body ?? {};

    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'message key is required' });
    }

    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({ error: 'signature is required' });
    }

    const message = await getMessage(key);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const authorFromKeyPart = authorFromKey(key);
    if (!authorFromKeyPart || getAddress(message.author) !== authorFromKeyPart) {
      return res.status(403).json({ error: 'Invalid message key' });
    }

    const author = getAddress(message.author);
    const signPayload = deleteSignPayload(key);

    let signer = null;
    try {
      signer = getAddress(await recoverSignerAddress(signPayload, signature));
    } catch {
      // ERC-1271 smart-account signatures cannot be recovered to an EOA address.
    }

    let isAuthor = signer === author;
    if (!isAuthor) {
      isAuthor = await verifyAuthorSignature(author, signPayload, signature);
    }

    let isMod = signer !== null && isModerator(signer);
    if (!isMod) {
      for (const modAddr of getModeratorAddresses()) {
        if (await verifyAuthorSignature(modAddr, signPayload, signature)) {
          isMod = true;
          break;
        }
      }
    }

    if (!isAuthor && !isMod) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await deleteMessage(key);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Chat delete error:', err);
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

router.post('/messages/:key/reactions/build', async (req, res) => {
  try {
    const { key } = req.params;
    const { reactor } = req.body ?? {};

    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'message key is required' });
    }

    if (!reactor || typeof reactor !== 'string' || !isAddress(reactor)) {
      return res.status(400).json({ error: 'Invalid reactor address' });
    }

    const message = await getMessage(key);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const author = getAddress(message.author);
    const reactorAddress = getAddress(reactor);

    if (author === reactorAddress) {
      return res
        .status(400)
        .json({ error: 'You cannot react to your own message' });
    }

    const existing = await getReaction(key, reactorAddress);
    if (existing) {
      return res.status(409).json({ error: 'You already reacted to this message' });
    }

    const reaction = await saveReaction({
      messageId: key,
      reactionAuthor: reactorAddress,
      timestamp: Math.floor(Date.now() / 1000),
    });

    const transactions = await buildReactionTransfer({
      messageAuthor: author,
      reactor: reactorAddress,
      messageText: message.text,
    });

    return res.json({ status: 'ready', reaction, transactions });
  } catch (err) {
    console.error('Reaction build error:', err);
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

export default router;
