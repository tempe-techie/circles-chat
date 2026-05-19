import { circlesConfig } from '@aboutcircles/sdk-core';
import { createPublicClient, http } from 'viem';
import { gnosis } from 'viem/chains';
import { chatContextAbi } from './abi';
import { CHAT_CONTRACT_ADDRESS } from './constants';
import type { ChainMessage } from './types';

const rpcUrl = circlesConfig[100].circlesRpcUrl;

export const publicClient = createPublicClient({
  chain: gnosis,
  transport: http(rpcUrl),
});

export async function fetchLastMainMessages(
  length: number,
): Promise<ChainMessage[]> {
  return publicClient.readContract({
    address: CHAT_CONTRACT_ADDRESS,
    abi: chatContextAbi,
    functionName: 'fetchLastMainMessages',
    args: [false, BigInt(length)],
  }) as Promise<ChainMessage[]>;
}

export async function fetchLastReplies(
  mainMsgIndex: bigint,
  length: number,
): Promise<ChainMessage[]> {
  return publicClient.readContract({
    address: CHAT_CONTRACT_ADDRESS,
    abi: chatContextAbi,
    functionName: 'fetchLastReplies',
    args: [false, mainMsgIndex, BigInt(length)],
  }) as Promise<ChainMessage[]>;
}

export async function getMainMessageCount(): Promise<bigint> {
  return publicClient.readContract({
    address: CHAT_CONTRACT_ADDRESS,
    abi: chatContextAbi,
    functionName: 'getMainMessageCount',
  });
}

export async function getPostPrice(): Promise<bigint> {
  return publicClient.readContract({
    address: CHAT_CONTRACT_ADDRESS,
    abi: chatContextAbi,
    functionName: 'price',
  });
}

export async function checkIsUserMod(address: `0x${string}`): Promise<boolean> {
  return publicClient.readContract({
    address: CHAT_CONTRACT_ADDRESS,
    abi: chatContextAbi,
    functionName: 'isUserMod',
    args: [address],
  });
}
