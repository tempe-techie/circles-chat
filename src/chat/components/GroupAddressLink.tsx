import type { MouseEvent } from 'react';
import { shortenAddress } from '../format';

export function gnosisScanAddressUrl(address: string): string {
  return `https://gnosisscan.io/address/${address}`;
}

export function GroupAddressLink({
  address,
  className = '',
  onClick,
}: {
  address: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={gnosisScanAddressUrl(address)}
      target="_blank"
      rel="noreferrer"
      className={`font-mono underline-offset-2 hover:underline ${className}`}
      onClick={onClick}
    >
      ({shortenAddress(address)})
    </a>
  );
}
