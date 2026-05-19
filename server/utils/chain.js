import { circlesConfig } from '@aboutcircles/sdk-core';
import { createPublicClient, http, recoverMessageAddress } from 'viem';
import { gnosis } from 'viem/chains';

const rpcUrl = circlesConfig[100].circlesRpcUrl;

export const publicClient = createPublicClient({
  chain: gnosis,
  transport: http(rpcUrl),
});

export async function verifyAuthorSignature(address, message, signature) {
  return publicClient.verifyMessage({
    address,
    message,
    signature,
  });
}

export async function recoverSignerAddress(message, signature) {
  return recoverMessageAddress({
    message,
    signature,
  });
}
