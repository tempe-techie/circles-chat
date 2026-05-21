import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { getAddress } from 'viem';
import { fetchUserProfile, type UserProfile } from './circles/profile';
import { ChatWall } from './chat/components/ChatWall';
import { MessageAvatar } from './chat/components/MessageAvatar';
import type { ChatChannel } from './chat/types';
import { useUserGroups } from './hooks/useUserGroups';
import { isMiniappMode, onWalletChange } from './host/bridge';

function GroupChatRoute({
  wallet,
  groups,
}: {
  wallet: string | null;
  groups: ReturnType<typeof useUserGroups>['groups'];
}) {
  const { groupAddress: groupAddressParam } = useParams<{
    groupAddress: string;
  }>();

  let normalizedAddress: string | null = null;
  try {
    if (groupAddressParam) {
      normalizedAddress = getAddress(groupAddressParam);
    }
  } catch {
    normalizedAddress = null;
  }

  const matchedGroup = normalizedAddress
    ? groups.find(
        (g) => g.address.toLowerCase() === normalizedAddress!.toLowerCase(),
      )
    : null;

  const channel: ChatChannel | null = useMemo(() => {
    if (!normalizedAddress) return null;
    if (matchedGroup) {
      return {
        kind: 'group',
        address: matchedGroup.address,
        channelName: matchedGroup.channelName,
        name: matchedGroup.name,
      };
    }
    return {
      kind: 'group',
      address: normalizedAddress,
      channelName: '#group',
      name: 'Group',
    };
  }, [normalizedAddress, matchedGroup]);

  if (!channel) {
    return <Navigate to="/" replace />;
  }

  return <ChatWall wallet={wallet} channel={channel} groups={groups} />;
}

export default function App() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [host] = useState<boolean>(() => isMiniappMode());
  const { groups } = useUserGroups(wallet);

  const loadProfile = useCallback(async (address: string) => {
    setProfileLoading(true);
    try {
      const data = await fetchUserProfile(address);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    onWalletChange((address) => {
      try {
        const checksummed = address ? getAddress(address) : null;
        setWallet(checksummed);
        setProfile(null);
        if (checksummed) {
          loadProfile(checksummed);
        }
      } catch {
        setWallet(null);
        setProfile(null);
      }
    });
    return () => {};
  }, [loadProfile]);

  const displayName = profile?.name ?? (wallet ? 'Circles user' : null);

  const generalChannel: ChatChannel = { kind: 'general' };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-3 px-1">
          {wallet && (
            <MessageAvatar
              profile={profile}
              address={wallet}
              size="md"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold truncate">
              {profileLoading
                ? 'Loading…'
                : displayName
                  ? `Hello, ${displayName}`
                  : 'Circles Chat'}
            </h1>
            <p className="text-xs text-slate-500 truncate">
              {wallet
                ? wallet
                : 'Connect your wallet in the Circles host'}
            </p>
          </div>
          <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-600 font-mono">
            {host ? 'host' : 'standalone'}
          </span>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <ChatWall
                wallet={wallet}
                channel={generalChannel}
                groups={groups}
              />
            }
          />
          <Route
            path="/group/:groupAddress"
            element={<GroupChatRoute wallet={wallet} groups={groups} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  );
}
