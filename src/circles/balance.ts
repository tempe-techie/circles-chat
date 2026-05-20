import { circlesConfig } from '@aboutcircles/sdk-core';
import { CirclesRpc } from '@aboutcircles/sdk-rpc';
import { CirclesConverter } from '@aboutcircles/sdk-utils';
import type { Address } from 'viem';
import { getAddress } from 'viem';

const config = circlesConfig[100];
const rpc = new CirclesRpc(config.circlesRpcUrl);

export async function fetchUserCrcBalance(address: string): Promise<number> {
  const normalized = getAddress(address);
  const atto = await rpc.balance.getTotalBalance(normalized);
  return CirclesConverter.attoCirclesToCircles(atto);
}

export async function fetchMaxFlowCrc(
  from: string,
  to: string,
): Promise<number> {
  const fromAddr: Address = getAddress(from);
  const toAddr: Address = getAddress(to);
  const atto = await rpc.pathfinder.findMaxFlow({
    from: fromAddr,
    to: toAddr,
    useWrappedBalances: true,
  });
  return CirclesConverter.attoCirclesToCircles(atto);
}

export function formatCrcBalance(amount: number): string {
  return amount.toFixed(6).replace(/\.?0+$/, '') || '0';
}
