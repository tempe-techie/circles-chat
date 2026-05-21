import { getAddress } from 'viem';
import datastore from '../utils/datastore.js';

const KIND = 'MessagesGroups';
const MAX_TEXT_LENGTH = 4000;
const GENERAL_KEY_LENGTH = 52;
export const GROUP_KEY_LENGTH = 94;

export function groupMessageKey(author, timestamp, groupAddress) {
  const ts = Math.floor(timestamp);
  const padded = String(ts).padStart(10, '0');
  const checksummedAuthor = getAddress(author);
  const checksummedGroup = getAddress(groupAddress);
  return `${padded}${checksummedAuthor}${checksummedGroup}`;
}

function entityToMessage(entity) {
  const key = entity[datastore.KEY].name;
  return {
    key,
    author: entity.author,
    text: entity.text,
    timestamp: entity.timestamp,
    groupAddress: entity.groupAddress,
    groupName: entity.groupName,
  };
}

export async function saveGroupMessage({
  author,
  text,
  timestamp,
  groupAddress,
  groupName,
}) {
  const trimmed = text?.trim();
  if (!author || !trimmed) {
    throw new Error('author and text are required');
  }
  if (!groupAddress || !groupName) {
    throw new Error('groupAddress and groupName are required');
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    throw new Error(`text must be at most ${MAX_TEXT_LENGTH} characters`);
  }
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    throw new Error('timestamp must be a number');
  }

  const ts = Math.floor(timestamp);
  const checksummedAuthor = getAddress(author);
  const checksummedGroup = getAddress(groupAddress);
  const key = groupMessageKey(checksummedAuthor, ts, checksummedGroup);

  await datastore.save({
    key: datastore.key([KIND, key]),
    data: {
      author: checksummedAuthor,
      text: trimmed,
      timestamp: ts,
      groupAddress: checksummedGroup,
      groupName: String(groupName).trim(),
    },
  });

  return {
    key,
    author: checksummedAuthor,
    text: trimmed,
    timestamp: ts,
    groupAddress: checksummedGroup,
    groupName: String(groupName).trim(),
  };
}

export async function getGroupMessage(key) {
  const entityKey = datastore.key([KIND, key]);
  const [entity] = await datastore.get(entityKey);
  if (!entity) return null;
  return entityToMessage(entity);
}

export async function deleteGroupMessage(key) {
  const entityKey = datastore.key([KIND, key]);
  await datastore.delete(entityKey);
}

export async function listGroupMessages({
  groupAddress,
  limit = 10,
  cursor,
} = {}) {
  const checksummedGroup = getAddress(groupAddress);

  let query = datastore
    .createQuery(KIND)
    .filter('groupAddress', '=', checksummedGroup)
    .order('__key__', { descending: true });

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

export function authorFromGroupKey(key) {
  if (typeof key !== 'string' || key.length !== GROUP_KEY_LENGTH) return null;
  const addressPart = key.slice(10, 52);
  try {
    return getAddress(addressPart);
  } catch {
    return null;
  }
}

export function isGroupMessageKey(key) {
  return typeof key === 'string' && key.length === GROUP_KEY_LENGTH;
}
