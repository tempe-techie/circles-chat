import type { MessageBody } from './types';

export function arUrlToTxId(url: string): string | null {
  if (url.startsWith('ar://')) {
    return url.slice(5);
  }
  return null;
}

export function arUrlToGateway(url: string): string | null {
  const txId = arUrlToTxId(url);
  if (!txId) return null;
  return `https://arweave.net/${txId}`;
}

export async function fetchMessageBody(url: string): Promise<MessageBody> {
  const gateway = arUrlToGateway(url);
  if (!gateway) {
    throw new Error('Invalid Arweave URL');
  }

  const res = await fetch(gateway);
  if (!res.ok) {
    throw new Error(`Arweave fetch failed (${res.status})`);
  }

  const data = (await res.json()) as MessageBody;
  if (
    typeof data.author !== 'string' ||
    typeof data.text !== 'string' ||
    typeof data.timestamp !== 'number'
  ) {
    throw new Error('Invalid message JSON');
  }

  return data;
}
