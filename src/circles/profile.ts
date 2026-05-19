import { circlesConfig } from '@aboutcircles/sdk-core';
import { Profiles } from '@aboutcircles/sdk-profiles';
import type { Profile } from '@aboutcircles/sdk-types';
import { getAddress, isAddress } from 'viem';

const config = circlesConfig[100];
const rpcUrl = config.circlesRpcUrl.replace(/\/$/, '');

const profilesClient = new Profiles(config.circlesRpcUrl);

export type UserProfile = {
  address: string;
  name: string;
  description: string | null;
  previewImageUrl: string | null;
  imageUrl: string | null;
};

export type ProfileListItem = {
  address: string;
  name: string;
  description: string | null;
};

type ProfileSearchHit = {
  name?: string | null;
  description?: string | null;
  address?: string | null;
  CID?: string | null;
};

async function fetchSearchHits(url: string): Promise<ProfileSearchHit[]> {
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

async function hitToUserProfile(
  hit: ProfileSearchHit,
  address: string,
): Promise<UserProfile | null> {
  if (!hit?.name) return null;

  let pinned: Profile | undefined;
  if (hit.CID) {
    pinned = await profilesClient.get(hit.CID);
  }

  return {
    address: getAddress(address),
    name: pinned?.name ?? hit.name,
    description: pinned?.description ?? hit.description ?? null,
    previewImageUrl: pinned?.previewImageUrl ?? null,
    imageUrl: pinned?.imageUrl ?? null,
  };
}

function hitToListItem(hit: ProfileSearchHit): ProfileListItem | null {
  if (!hit?.name || !hit.address) return null;
  try {
    return {
      address: getAddress(hit.address),
      name: hit.name,
      description: hit.description ?? null,
    };
  } catch {
    return null;
  }
}

function searchUrlForQuery(query: string): string {
  const trimmed = query.trim();
  if (isAddress(trimmed, { strict: false })) {
    const address = getAddress(trimmed);
    return `${rpcUrl}/profiles/search?address=${encodeURIComponent(address.toLowerCase())}`;
  }
  return `${rpcUrl}/profiles/search?name=${encodeURIComponent(trimmed)}`;
}

export async function fetchUserProfile(
  address: string,
): Promise<UserProfile | null> {
  const normalized = getAddress(address);
  const hits = await fetchSearchHits(
    `${rpcUrl}/profiles/search?address=${encodeURIComponent(normalized.toLowerCase())}`,
  );
  return hitToUserProfile(hits[0], normalized);
}

export async function searchProfiles(
  query: string,
): Promise<ProfileListItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const hits = await fetchSearchHits(searchUrlForQuery(trimmed));
  const items: ProfileListItem[] = [];
  const seen = new Set<string>();

  for (const hit of hits) {
    const item = hitToListItem(hit);
    if (!item || seen.has(item.address)) continue;
    seen.add(item.address);
    items.push(item);
    if (items.length >= 20) break;
  }

  return items;
}
