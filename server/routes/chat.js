import { Router } from 'express';
import { getAddress, isAddress } from 'viem';
import {
  authorFromKey,
  deleteMessage,
  getMessage,
  listMessages,
  saveMessage,
} from '../datastore/messages.js';
import {
  authorFromGroupKey,
  deleteGroupMessage,
  getGroupMessage,
  isGroupMessageKey,
  listGroupMessages,
  saveGroupMessage,
} from '../datastore/messages-groups.js';
import {
  authorFromProfileKey,
  deleteProfileMessage,
  getProfileMessage,
  isProfileMessageKey,
  listProfileMessages,
  saveProfileMessage,
} from '../datastore/messages-profiles.js';
import { getModeratorAddresses, isModerator } from '../datastore/moderators.js';
import {
  getReaction,
  listReactionsForMessages,
  saveReaction,
} from '../datastore/reactions.js';
import {
  createSession,
  isValidSessionKey,
  verifySession,
} from '../datastore/sessions.js';
import { recoverSignerAddress, verifyAuthorSignature } from '../utils/chain.js';
import { buildReactionTransfer } from '../utils/reaction-payment.js';
import { buildTipTransfer } from '../utils/tip-payment.js';

const router = Router();

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const CHANNEL_NAME_PATTERN = /^#[a-z0-9-]+$/;

const SESSION_SIGN_PREFIX = 'circles-chat:session:';

function sessionSignPayload(sessionKey) {
  return `${SESSION_SIGN_PREFIX}${sessionKey}`;
}

/**
 * Validate the session key carried in a request body against the claimed
 * author/actor address. Sends a 401 (with a SESSION_REQUIRED code so the
 * client can prompt re-verification) and returns false when invalid.
 */
async function ensureValidSession(req, res, address) {
  const { sessionKey } = req.body ?? {};
  if (!isValidSessionKey(sessionKey)) {
    res
      .status(401)
      .json({ error: 'Verification required', code: 'SESSION_REQUIRED' });
    return false;
  }

  const ok = await verifySession(sessionKey, address);
  if (!ok) {
    res
      .status(401)
      .json({ error: 'Verification required', code: 'SESSION_REQUIRED' });
    return false;
  }

  return true;
}

async function resolveMessageByKey(key) {
  if (isProfileMessageKey(key)) {
    const message = await getProfileMessage(key);
    return { message, kind: message ? 'profile' : null };
  }
  if (isGroupMessageKey(key)) {
    const message = await getGroupMessage(key);
    return { message, kind: message ? 'group' : null };
  }
  const message = await getMessage(key);
  return { message, kind: message ? 'general' : null };
}

async function deleteMessageByKind(key, kind) {
  if (kind === 'group') return deleteGroupMessage(key);
  if (kind === 'profile') return deleteProfileMessage(key);
  return deleteMessage(key);
}

function authorFromMessageKey(key) {
  if (isProfileMessageKey(key)) {
    return authorFromProfileKey(key);
  }
  if (isGroupMessageKey(key)) {
    return authorFromGroupKey(key);
  }
  return authorFromKey(key);
}

router.get('/moderators', (_req, res) => {
  return res.json({ moderators: getModeratorAddresses() });
});

router.post('/sessions', async (req, res) => {
  try {
    const { address, sessionKey, signature } = req.body ?? {};

    if (!address || typeof address !== 'string' || !isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    if (!isValidSessionKey(sessionKey)) {
      return res.status(400).json({ error: 'Invalid session key' });
    }

    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({ error: 'signature is required' });
    }

    const userAddress = getAddress(address);
    const signPayload = sessionSignPayload(sessionKey);

    // The signature proves the wallet owner authorized this exact session key.
    let signer = null;
    try {
      signer = getAddress(await recoverSignerAddress(signPayload, signature));
    } catch {
      // ERC-1271 smart-account signatures cannot be recovered to an EOA address.
    }

    let verified = signer === userAddress;
    if (!verified) {
      verified = await verifyAuthorSignature(userAddress, signPayload, signature);
    }

    if (!verified) {
      return res
        .status(401)
        .json({ error: 'Signature does not match the address' });
    }

    await createSession({ userAddress, sessionKey });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Session create error:', err);
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
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

    const groupAddressRaw =
      typeof req.query.groupAddress === 'string' && req.query.groupAddress.trim()
        ? req.query.groupAddress.trim()
        : undefined;

    const profileAddressRaw =
      typeof req.query.profileAddress === 'string' &&
      req.query.profileAddress.trim()
        ? req.query.profileAddress.trim()
        : undefined;

    let messages;
    let nextCursor;
    let hasMore;

    if (profileAddressRaw) {
      if (!isAddress(profileAddressRaw)) {
        return res.status(400).json({ error: 'Invalid profileAddress' });
      }

      const result = await listProfileMessages({
        profileAddress: getAddress(profileAddressRaw),
        limit,
        cursor,
      });
      messages = result.messages;
      nextCursor = result.nextCursor;
      hasMore = result.hasMore;
    } else if (groupAddressRaw) {
      if (!isAddress(groupAddressRaw)) {
        return res.status(400).json({ error: 'Invalid groupAddress' });
      }

      const result = await listGroupMessages({
        groupAddress: getAddress(groupAddressRaw),
        limit,
        cursor,
      });
      messages = result.messages;
      nextCursor = result.nextCursor;
      hasMore = result.hasMore;
    } else {
      const result = await listMessages({ limit, cursor });
      messages = result.messages;
      nextCursor = result.nextCursor;
      hasMore = result.hasMore;
    }

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
    const {
      author,
      text,
      timestamp,
      groupAddress,
      groupName,
      profileAddress,
      profileName,
    } = req.body ?? {};

    if (!author || typeof author !== 'string' || !isAddress(author)) {
      return res.status(400).json({ error: 'Invalid author address' });
    }

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    if (!(await ensureValidSession(req, res, getAddress(author)))) {
      return undefined;
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

    const hasProfileAddress =
      profileAddress != null && String(profileAddress).trim() !== '';
    const hasProfileName =
      profileName != null && String(profileName).trim() !== '';

    if (hasProfileAddress !== hasProfileName) {
      return res
        .status(400)
        .json({ error: 'profileAddress and profileName must both be provided' });
    }

    if (hasProfileAddress) {
      if (!isAddress(profileAddress)) {
        return res.status(400).json({ error: 'Invalid profileAddress' });
      }

      const message = await saveProfileMessage({
        author: getAddress(author),
        text,
        timestamp: ts,
        profileAddress: getAddress(profileAddress),
        profileName: String(profileName).trim(),
      });

      return res.json(message);
    }

    const hasGroupAddress =
      groupAddress != null && String(groupAddress).trim() !== '';
    const hasGroupName =
      groupName != null && String(groupName).trim() !== '';

    if (hasGroupAddress !== hasGroupName) {
      return res
        .status(400)
        .json({ error: 'groupAddress and groupName must both be provided' });
    }

    if (hasGroupAddress) {
      if (!isAddress(groupAddress)) {
        return res.status(400).json({ error: 'Invalid groupAddress' });
      }

      const trimmedName = String(groupName).trim();
      if (!CHANNEL_NAME_PATTERN.test(trimmedName)) {
        return res.status(400).json({
          error: 'groupName must be a channel slug like #circles-backers',
        });
      }

      const message = await saveGroupMessage({
        author: getAddress(author),
        text,
        timestamp: ts,
        groupAddress: getAddress(groupAddress),
        groupName: trimmedName,
      });

      return res.json(message);
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
    const { actor } = req.body ?? {};

    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'message key is required' });
    }

    if (!actor || typeof actor !== 'string' || !isAddress(actor)) {
      return res.status(400).json({ error: 'Invalid actor address' });
    }

    const actorAddress = getAddress(actor);

    // The actor is authenticated via their session key (same system as posting).
    if (!(await ensureValidSession(req, res, actorAddress))) {
      return undefined;
    }

    const { message, kind } = await resolveMessageByKey(key);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const authorFromKeyPart = authorFromMessageKey(key);
    if (!authorFromKeyPart || getAddress(message.author) !== authorFromKeyPart) {
      return res.status(403).json({ error: 'Invalid message key' });
    }

    const author = getAddress(message.author);
    const isAuthor = actorAddress === author;
    const isMod = isModerator(actorAddress);

    if (!isAuthor && !isMod) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await deleteMessageByKind(key, kind);
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

    const { message } = await resolveMessageByKey(key);
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

router.post('/tips/build', async (req, res) => {
  try {
    const { sender, recipient, amount } = req.body ?? {};

    if (!sender || typeof sender !== 'string' || !isAddress(sender)) {
      return res.status(400).json({ error: 'Invalid sender address' });
    }

    if (!recipient || typeof recipient !== 'string' || !isAddress(recipient)) {
      return res.status(400).json({ error: 'Invalid recipient address' });
    }

    const senderAddress = getAddress(sender);
    const recipientAddress = getAddress(recipient);

    if (senderAddress === recipientAddress) {
      return res.status(400).json({ error: 'You cannot tip yourself' });
    }

    const transactions = await buildTipTransfer({
      sender: senderAddress,
      recipient: recipientAddress,
      amount,
    });

    return res.json({ status: 'ready', transactions });
  } catch (err) {
    console.error('Tip build error:', err);
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

export default router;
