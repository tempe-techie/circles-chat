import type { UserProfile } from '../../circles/profile';
import { shortenAddress } from '../format';

export function MessageAvatar({
  profile,
  address,
  size = 'md',
}: {
  profile: UserProfile | null;
  address: string;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  const avatarSrc = profile?.previewImageUrl ?? profile?.imageUrl;
  const label = profile?.name ?? shortenAddress(address);

  if (avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt={label}
        className={`${dim} shrink-0 rounded-full object-cover ring-1 ring-slate-700`}
      />
    );
  }

  const initial = (profile?.name ?? address).charAt(0).toUpperCase();
  return (
    <div
      className={`${dim} shrink-0 flex items-center justify-center rounded-full bg-slate-800 font-semibold text-slate-400 ring-1 ring-slate-700`}
    >
      {initial}
    </div>
  );
}
