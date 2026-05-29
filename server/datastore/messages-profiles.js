import { getAddress } from 'viem';
import datastore from '../utils/datastore.js';

const KIND = 'MessagesProfiles';
const MAX_TEXT_LENGTH = 4000;
const MAX_PROFILE_NAME_LENGTH = 256;
const PROFILE_KEY_PREFIX = 'pm';
// prefix(2) + timestamp(10) + author(42) + profile(42)
export const PROFILE_KEY_LENGTH = 96;

export function profileMessageKey(author, timestamp, profileAddress) {
  const ts = Math.floor(timestamp);
  const padded = String(ts).padStart(10, '0');
  const checksummedAuthor = getAddress(author);
  const checksummedProfile = getAddress(profileAddress);
  return `${PROFILE_KEY_PREFIX}${padded}${checksummedAuthor}${checksummedProfile}`;
}

function entityToMessage(entity) {
  const key = entity[datastore.KEY].name;
  return {
    key,
    author: entity.author,
    text: entity.text,
    timestamp: entity.timestamp,
    profileAddress: entity.profileAddress,
    profileName: entity.profileName,
  };
}

export async function saveProfileMessage({
  author,
  text,
  timestamp,
  profileAddress,
  profileName,
}) {
  const trimmed = text?.trim();
  if (!author || !trimmed) {
    throw new Error('author and text are required');
  }
  if (!profileAddress || !profileName) {
    throw new Error('profileAddress and profileName are required');
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    throw new Error(`text must be at most ${MAX_TEXT_LENGTH} characters`);
  }
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    throw new Error('timestamp must be a number');
  }

  const ts = Math.floor(timestamp);
  const checksummedAuthor = getAddress(author);
  const checksummedProfile = getAddress(profileAddress);
  const trimmedName = String(profileName).trim().slice(0, MAX_PROFILE_NAME_LENGTH);
  const key = profileMessageKey(checksummedAuthor, ts, checksummedProfile);

  await datastore.save({
    key: datastore.key([KIND, key]),
    data: {
      author: checksummedAuthor,
      text: trimmed,
      timestamp: ts,
      profileAddress: checksummedProfile,
      profileName: trimmedName,
    },
  });

  return {
    key,
    author: checksummedAuthor,
    text: trimmed,
    timestamp: ts,
    profileAddress: checksummedProfile,
    profileName: trimmedName,
  };
}

export async function getProfileMessage(key) {
  const entityKey = datastore.key([KIND, key]);
  const [entity] = await datastore.get(entityKey);
  if (!entity) return null;
  return entityToMessage(entity);
}

export async function deleteProfileMessage(key) {
  const entityKey = datastore.key([KIND, key]);
  await datastore.delete(entityKey);
}

export async function listProfileMessages({
  profileAddress,
  limit = 10,
  cursor,
} = {}) {
  const checksummedProfile = getAddress(profileAddress);

  let query = datastore
    .createQuery(KIND)
    .filter('profileAddress', '=', checksummedProfile)
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

export function authorFromProfileKey(key) {
  if (!isProfileMessageKey(key)) return null;
  const addressPart = key.slice(12, 54);
  try {
    return getAddress(addressPart);
  } catch {
    return null;
  }
}

export function isProfileMessageKey(key) {
  return (
    typeof key === 'string' &&
    key.length === PROFILE_KEY_LENGTH &&
    key.startsWith(PROFILE_KEY_PREFIX)
  );
}
