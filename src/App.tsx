import { useCallback, useEffect, useState } from 'react';
import { getAddress } from 'viem';
import { fetchUserProfile, type UserProfile } from './circles/profile';
import { ChatWall } from './chat/components/ChatWall';
import { MessageAvatar } from './chat/components/MessageAvatar';
import { isMiniappMode, onWalletChange } from './host/bridge';

export default function App() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [host] = useState<boolean>(() => isMiniappMode());

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

        <ChatWall wallet={wallet} />
      </div>
    </main>
  );
}
