import { Router } from 'express';
import { getAddress, isAddress } from 'viem';
import {
  authorFromKey,
  deleteMessage,
  getMessage,
  listMessages,
  saveMessage,
} from '../datastore/messages.js';
import { verifyAuthorSignature } from '../utils/chain.js';

const router = Router();

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function deleteSignPayload(messageKey) {
  return `circles-chat:delete:${messageKey}`;
}

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

    const before =
      typeof req.query.before === 'string' && req.query.before.trim()
        ? req.query.before.trim()
        : undefined;

    const messages = await listMessages({ limit, beforeKey: before });
    return res.json({ messages });
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
    const valid = await verifyAuthorSignature(author, signPayload, signature);

    if (!valid) {
      return res.status(403).json({ error: 'Invalid signature' });
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

export default router;
