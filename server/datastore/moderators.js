import { getAddress, isAddress } from 'viem';
import datastore from '../utils/datastore.js';

const KIND = 'Moderators';

/** @type {Set<string>} */
let moderatorAddresses = new Set();

export function isModerator(address) {
  if (!address || typeof address !== 'string') return false;
  try {
    return moderatorAddresses.has(getAddress(address));
  } catch {
    return false;
  }
}

export function getModeratorAddresses() {
  return [...moderatorAddresses];
}

export async function loadModerators() {
  const query = datastore.createQuery(KIND);
  const [entities] = await datastore.runQuery(query);

  const next = new Set();
  for (const entity of entities) {
    const raw = entity.address;
    if (typeof raw !== 'string' || !isAddress(raw)) {
      console.warn('Moderators entry missing valid address:', entity[datastore.KEY]);
      continue;
    }
    next.add(getAddress(raw));
  }

  moderatorAddresses = next;
  console.log(`Loaded ${moderatorAddresses.size} moderator(s) from Datastore`);
  return getModeratorAddresses();
}
