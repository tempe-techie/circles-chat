import type { UserGroup } from './groups';

const STORAGE_PREFIX = 'circles-chat:user-groups:';

function storageKey(wallet: string): string {
  return `${STORAGE_PREFIX}${wallet.toLowerCase()}`;
}

export function readCachedUserGroups(wallet: string): UserGroup[] | null {
  try {
    const raw = localStorage.getItem(storageKey(wallet));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserGroup[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCachedUserGroups(wallet: string, groups: UserGroup[]): void {
  try {
    localStorage.setItem(storageKey(wallet), JSON.stringify(groups));
  } catch {
    // ignore quota / private mode errors
  }
}
