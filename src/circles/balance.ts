import { circlesConfig } from '@aboutcircles/sdk-core';
import { CirclesRpc } from '@aboutcircles/sdk-rpc';
import { CirclesConverter } from '@aboutcircles/sdk-utils';
import { getAddress } from 'viem';

const config = circlesConfig[100];
const rpc = new CirclesRpc(config.circlesRpcUrl);

export async function fetchUserCrcBalance(address: string): Promise<number> {
  const normalized = getAddress(address);
  const atto = await rpc.balance.getTotalBalance(normalized);
  return CirclesConverter.attoCirclesToCircles(atto);
}

export function formatCrcBalance(amount: number): string {
  return amount.toFixed(6).replace(/\.?0+$/, '') || '0';
}
