import { useCallback, useEffect, useState } from 'react';
import { getAddress } from 'viem';
import {
  fetchUserProfile,
  searchProfiles,
  type ProfileListItem,
  type UserProfile,
} from './circles/profile';
import { isMiniappMode, onWalletChange } from './host/bridge';

function ProfileCardContent({
  profile,
  subtitle,
  showTitle = true,
  showAddress = true,
}: {
  profile: UserProfile;
  subtitle?: string;
  showTitle?: boolean;
  showAddress?: boolean;
}) {
  const avatarSrc = profile.previewImageUrl ?? profile.imageUrl;

  return (
    <div className="space-y-4 text-center">
      {subtitle && (
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {subtitle}
        </p>
      )}
      {showTitle && <h2 className="text-2xl font-bold">{profile.name}</h2>}

      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={`${profile.name}'s avatar`}
          className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-slate-700"
        />
      ) : (
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-2xl font-semibold text-slate-400 ring-2 ring-slate-700">
          {profile.name.charAt(0).toUpperCase()}
        </div>
      )}

      <p className="text-sm text-slate-300 whitespace-pre-wrap">
        {profile.description?.trim()
          ? profile.description
          : 'No description yet.'}
      </p>

      {showAddress && (
        <p className="text-xs text-slate-500 font-mono break-all">
          {profile.address}
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);
  const [viewedLoading, setViewedLoading] = useState(false);
  const [viewedError, setViewedError] = useState<string | null>(null);

  const [host] = useState<boolean>(() => isMiniappMode());

  const loadProfile = useCallback(async (address: string) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await fetchUserProfile(address);
      setProfile(data);
      if (!data) {
        setProfileError('No Circles profile found for this wallet.');
      }
    } catch {
      setProfileError('Could not load profile.');
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const loadViewedProfile = useCallback(async (address: string) => {
    setViewedLoading(true);
    setViewedError(null);
    setViewedProfile(null);
    try {
      const data = await fetchUserProfile(address);
      setViewedProfile(data);
      if (!data) {
        setViewedError('No Circles profile found for this user.');
      }
    } catch {
      setViewedError('Could not load profile.');
    } finally {
      setViewedLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onWalletChange((address) => {
      try {
        const checksummed = address ? getAddress(address) : null;
        setWallet(checksummed);
        setProfile(null);
        setProfileError(null);
        if (checksummed) {
          loadProfile(checksummed);
        }
      } catch {
        setWallet(null);
        setProfile(null);
      }
    });
    return () => {
      unsub?.();
    };
  }, [loadProfile]);

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setViewedProfile(null);
    setViewedError(null);

    try {
      const results = await searchProfiles(q);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No profiles found. Try a different name or address.');
      }
    } catch {
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md w-full rounded-2xl bg-slate-900/70 ring-1 ring-slate-800 p-8 space-y-8 text-center">
        <section className="space-y-6">
          {!wallet ? (
            <>
              <h1 className="text-3xl font-bold">Hello</h1>
              <p className="text-sm text-slate-400">
                Connect your wallet in the Circles host to see your profile.
              </p>
            </>
          ) : profileLoading ? (
            <p className="text-sm text-slate-400">Loading profile…</p>
          ) : profile ? (
            <>
              <h1 className="text-3xl font-bold">Hello {profile.name}</h1>
              <ProfileCardContent
                profile={profile}
                showTitle={false}
                showAddress={false}
              />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">Hello</h1>
              <p className="text-sm text-red-400">
                {profileError ?? 'Profile unavailable.'}
              </p>
            </>
          )}
        </section>

        <section className="space-y-4 text-left border-t border-slate-800 pt-8">
          <h2 className="text-lg font-semibold text-center">Search users</h2>
          <p className="text-xs text-slate-500 text-center">
            Search by display name or wallet address (0x…).
          </p>

          <form onSubmit={runSearch} className="flex gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or address"
              className="min-w-0 flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {searching ? '…' : 'Search'}
            </button>
          </form>

          {searchError && (
            <p className="text-xs text-red-400 text-center">{searchError}</p>
          )}

          {searchResults.length > 0 && (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map((item) => (
                <li key={item.address}>
                  <button
                    type="button"
                    onClick={() => loadViewedProfile(item.address)}
                    className="w-full rounded-lg bg-slate-800/80 px-3 py-2 text-left ring-1 ring-slate-700 hover:ring-emerald-600/50 transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-100 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {item.address}
                    </p>
                    {item.description?.trim() && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {hasSearched &&
            !searching &&
            searchResults.length === 0 &&
            !searchError && (
              <p className="text-xs text-slate-500 text-center">
                No results for &ldquo;{searchQuery.trim()}&rdquo;.
              </p>
            )}

          {(viewedLoading || viewedProfile || viewedError) && (
            <div className="border-t border-slate-800 pt-4 text-center">
              {viewedLoading ? (
                <p className="text-sm text-slate-400">Loading profile…</p>
              ) : viewedProfile ? (
                <ProfileCardContent
                  profile={viewedProfile}
                  subtitle="Selected profile"
                />
              ) : (
                <p className="text-sm text-red-400">{viewedError}</p>
              )}
            </div>
          )}
        </section>

        <p className="text-xs text-slate-500 break-all text-center">
          Mode:{' '}
          <span className="font-mono">
            {host ? 'embedded (host)' : 'standalone'}
          </span>
          {wallet && (
            <>
              <br />
              <span className="font-mono text-slate-400">{wallet}</span>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
