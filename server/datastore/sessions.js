import crypto from 'node:crypto';
import { getAddress } from 'viem';
import datastore from '../utils/datastore.js';
import { getEnvVar } from '../utils/env-vars.js';

const KIND = 'UserSessions';

// Sessions are valid for 120 days, after which the user must verify again.
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 120;

// A session key is a 64-character hex string generated in the user's browser.
const SESSION_KEY_PATTERN = /^[0-9a-f]{64}$/i;

let cachedSecret = null;

async function getHmacSecret() {
  if (cachedSecret) return cachedSecret;
  const secret = await getEnvVar('SESSION_HMAC_SECRET');
  if (!secret || typeof secret !== 'string') {
    throw new Error('SESSION_HMAC_SECRET is not configured');
  }
  cachedSecret = secret;
  return cachedSecret;
}

export function isValidSessionKey(sessionKey) {
  return typeof sessionKey === 'string' && SESSION_KEY_PATTERN.test(sessionKey);
}

/**
 * Hash a plaintext session key into the value used as the datastore entity key.
 * Plaintext session keys are never persisted; only this HMAC digest is stored.
 */
export async function hashSessionKey(sessionKey) {
  const secret = await getHmacSecret();
  return crypto.createHmac('sha256', secret).update(sessionKey).digest('hex');
}

/**
 * Persist a new session for a verified user. The entity key is the HMAC of the
 * session key, so a single user can hold several concurrent sessions.
 */
export async function createSession({ userAddress, sessionKey }) {
  if (!isValidSessionKey(sessionKey)) {
    throw new Error('Invalid session key');
  }
  const checksummed = getAddress(userAddress);
  const hash = await hashSessionKey(sessionKey);
  const timestamp = Date.now();

  await datastore.save({
    key: datastore.key([KIND, hash]),
    data: {
      userAddress: checksummed,
      timestamp,
    },
  });

  return { userAddress: checksummed, timestamp };
}

/**
 * Look up a session by its plaintext key (which is hashed before querying).
 * Returns null when the session does not exist or has expired.
 */
export async function getSession(sessionKey) {
  if (!isValidSessionKey(sessionKey)) return null;

  const hash = await hashSessionKey(sessionKey);
  const [entity] = await datastore.get(datastore.key([KIND, hash]));
  if (!entity) return null;

  if (
    SESSION_TTL_MS > 0 &&
    (typeof entity.timestamp !== 'number' ||
      Date.now() - entity.timestamp > SESSION_TTL_MS)
  ) {
    return null;
  }

  return { userAddress: entity.userAddress, timestamp: entity.timestamp };
}

/**
 * Verify that a session key belongs to the given user address. The session key
 * is hashed, the matching entity is fetched, and its stored userAddress is
 * compared against the address claimed in the request.
 */
export async function verifySession(sessionKey, userAddress) {
  let session;
  try {
    session = await getSession(sessionKey);
  } catch {
    return false;
  }
  if (!session) return false;

  try {
    return getAddress(session.userAddress) === getAddress(userAddress);
  } catch {
    return false;
  }
}
