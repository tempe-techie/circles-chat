import { getAddress } from 'viem';
import { signMessage } from '../host/bridge';
import { registerSession } from './api';
import { SESSION_SIGN_PREFIX, SESSION_STORAGE_PREFIX } from './constants';

function storageKey(address: string): string {
  return `${SESSION_STORAGE_PREFIX}${address.toLowerCase()}`;
}

function readStoredSessionKey(address: string): string | null {
  try {
    return window.localStorage.getItem(storageKey(address));
  } catch {
    return null;
  }
}

function writeStoredSessionKey(address: string, sessionKey: string): void {
  try {
    window.localStorage.setItem(storageKey(address), sessionKey);
  } catch {
    // Storage may be unavailable (e.g. private mode); session simply won't persist.
  }
}

export function clearStoredSessionKey(address: string): void {
  try {
    window.localStorage.removeItem(storageKey(address));
  } catch {
    // Ignore storage errors.
  }
}

function generateSessionKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Run a wallet-signature verification flow and register a fresh session with
 * the server. The plaintext session key is generated here and stored only in
 * the browser; the server persists just its HMAC hash.
 */
async function verifyAndCreateSession(address: string): Promise<string> {
  const sessionKey = generateSessionKey();
  const { signature } = await signMessage(`${SESSION_SIGN_PREFIX}${sessionKey}`);
  await registerSession(address, sessionKey, signature);
  writeStoredSessionKey(address, sessionKey);
  return sessionKey;
}

/**
 * Return a usable session key for the given wallet, prompting the user to
 * verify (sign a message) only when no session key is stored in the browser.
 * Pass `forceReverify` to discard the stored key and verify again (e.g. after
 * the server reports an expired/invalid session).
 */
export async function ensureSession(
  wallet: string,
  { forceReverify = false }: { forceReverify?: boolean } = {},
): Promise<string> {
  const address = getAddress(wallet);

  if (forceReverify) {
    clearStoredSessionKey(address);
  } else {
    const existing = readStoredSessionKey(address);
    if (existing) return existing;
  }

  return verifyAndCreateSession(address);
}
