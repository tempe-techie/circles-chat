import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { getAddress } from 'viem';
import { fetchUserProfile, type UserProfile } from './circles/profile';
import { ChatWall } from './chat/components/ChatWall';
import { MessageAvatar } from './chat/components/MessageAvatar';
import type { ChatChannel } from './chat/types';
import { useUserGroups } from './hooks/useUserGroups';
import { onWalletChange } from './host/bridge';

const SHARE_PLAYGROUND_URL =
  'https://circles.gnosis.io/playground?url=https%3A%2F%2Fapp.circles-chat.org';

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
  const [shareCopied, setShareCopied] = useState(false);
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

  const subtitle = !wallet
    ? 'Connect your wallet in the Circles Playground'
    : profileLoading
      ? 'Loading your profile…'
      : `Hello, ${profile?.name ?? 'Circles user'}!`;

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SHARE_PLAYGROUND_URL);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 3000);
    } catch {
      setShareCopied(false);
    }
  }, []);

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
            <h1 className="text-xl font-bold truncate">Circles Chat</h1>
            <p className="text-xs text-slate-500 truncate">{subtitle}</p>
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => void copyShareLink()}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              aria-label="Copy share link"
              title="Copy share link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-share-fill" viewBox="0 0 16 16">
                <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5"/>
              </svg>
            </button>
            {shareCopied && (
              <p
                role="status"
                className="absolute right-0 top-full z-10 mt-1 w-max max-w-[14rem] rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-200 shadow-lg ring-1 ring-slate-700"
              >
                Share link copied to clipboard
              </p>
            )}
          </div>
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
