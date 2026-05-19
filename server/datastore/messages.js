import { getAddress } from 'viem';
import datastore from '../utils/datastore.js';

const KIND = 'MessagesGeneral';
const MAX_TEXT_LENGTH = 4000;

export function messageKey(author, timestamp) {
  const ts = Math.floor(timestamp);
  const padded = String(ts).padStart(10, '0');
  const checksummed = getAddress(author);
  return `${padded}${checksummed}`;
}

function entityToMessage(entity) {
  const key = entity[datastore.KEY].name;
  return {
    key,
    author: entity.author,
    text: entity.text,
    timestamp: entity.timestamp,
  };
}

export async function saveMessage({ author, text, timestamp }) {
  const trimmed = text?.trim();
  if (!author || !trimmed) {
    throw new Error('author and text are required');
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    throw new Error(`text must be at most ${MAX_TEXT_LENGTH} characters`);
  }
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    throw new Error('timestamp must be a number');
  }

  const ts = Math.floor(timestamp);
  const checksummed = getAddress(author);
  const key = messageKey(checksummed, ts);

  await datastore.save({
    key: datastore.key([KIND, key]),
    data: {
      author: checksummed,
      text: trimmed,
      timestamp: ts,
    },
  });

  return { key, author: checksummed, text: trimmed, timestamp: ts };
}

export async function getMessage(key) {
  const entityKey = datastore.key([KIND, key]);
  const [entity] = await datastore.get(entityKey);
  if (!entity) return null;
  return entityToMessage(entity);
}

export async function deleteMessage(key) {
  const entityKey = datastore.key([KIND, key]);
  await datastore.delete(entityKey);
}

export async function listMessages({ limit = 10, cursor } = {}) {
  let query = datastore.createQuery(KIND).order('__key__', { descending: true });

  if (cursor) {
    query = query.start(cursor);
  }

  query = query.limit(limit);

  const [entities, info] = await datastore.runQuery(query);
  const messages = entities.map(entityToMessage);
  messages.reverse();
  return {
    messages,
    nextCursor: info.endCursor ?? null,
    hasMore: info.moreResults !== datastore.NO_MORE_RESULTS,
  };
}

export function authorFromKey(key) {
  if (typeof key !== 'string' || key.length < 42) return null;
  const addressPart = key.slice(-42);
  try {
    return getAddress(addressPart);
  } catch {
    return null;
  }
}
