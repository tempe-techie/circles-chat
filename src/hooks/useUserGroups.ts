import { useEffect, useState } from 'react';
import { fetchUserGroups, type UserGroup } from '../circles/groups';
import {
  readCachedUserGroups,
  writeCachedUserGroups,
} from '../circles/groups-storage';

export function useUserGroups(wallet: string | null) {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!wallet) {
      setGroups([]);
      setSyncing(false);
      return;
    }

    const cached = readCachedUserGroups(wallet);
    setGroups(cached ?? []);

    let cancelled = false;
    setSyncing(true);

    void fetchUserGroups(wallet)
      .then((fresh) => {
        if (cancelled) return;
        setGroups(fresh);
        writeCachedUserGroups(wallet, fresh);
      })
      .catch(() => {
        // keep cached groups on failure
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wallet]);

  return { groups, syncing };
}
