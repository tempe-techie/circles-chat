import { getAddress } from 'viem';
import { sendTransactions, signMessage } from '../host/bridge';
import {
  buildMessageReaction,
  deleteMessage,
  postMessage,
  type PostMessageGroup,
} from './api';
import { DELETE_SIGN_PREFIX } from './constants';
import type { ChatChannel } from './types';

function toHexValue(value: string | bigint | undefined): string {
  if (value == null || value === '' || value === '0') return '0x0';
  if (typeof value === 'string' && value.startsWith('0x')) return value;
  return `0x${BigInt(value).toString(16)}`;
}

function formatTxForHost(tx: {
  to: string;
  data?: string;
  value?: string;
}) {
  return {
    to: tx.to,
    data: tx.data ?? '0x',
    value: toHexValue(tx.value),
  };
}

function groupFromChannel(channel: ChatChannel): PostMessageGroup | undefined {
  if (channel.kind !== 'group') return undefined;
  return {
    address: channel.address,
    channelName: channel.channelName,
  };
}

export async function postChannelMessage(
  author: string,
  text: string,
  channel: ChatChannel,
): Promise<void> {
  await postMessage(author, text, groupFromChannel(channel));
}

export async function postMainMessage(
  author: string,
  text: string,
): Promise<void> {
  await postMessage(author, text);
}

export async function deleteMainMessage(key: string): Promise<void> {
  const signPayload = `${DELETE_SIGN_PREFIX}${key}`;
  const { signature } = await signMessage(signPayload);
  await deleteMessage(key, signature);
}

export async function reactToMessage(
  messageKey: string,
  reactor: string,
): Promise<void> {
  const reactorAddress = getAddress(reactor);
  const { transactions } = await buildMessageReaction(
    messageKey,
    reactorAddress,
  );

  await sendTransactions(transactions.map(formatTxForHost));
}
