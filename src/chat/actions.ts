import { getAddress } from 'viem';
import { sendTransactions } from '../host/bridge';
import {
  buildMessageReaction,
  buildTip,
  deleteMessage,
  postMessage,
  SessionRequiredError,
  type PostMessageTarget,
} from './api';
import { ensureSession } from './session';
import type { ChatChannel } from './types';

/**
 * Run an action that needs a valid session. The session is created on first use
 * (prompting the user to sign), reused afterwards, and re-verified once if the
 * server reports it as expired/invalid.
 */
async function withSession<T>(
  wallet: string,
  run: (sessionKey: string) => Promise<T>,
): Promise<T> {
  const sessionKey = await ensureSession(wallet);
  try {
    return await run(sessionKey);
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      const freshKey = await ensureSession(wallet, { forceReverify: true });
      return run(freshKey);
    }
    throw err;
  }
}

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

function targetFromChannel(
  channel: ChatChannel,
): PostMessageTarget | undefined {
  if (channel.kind === 'group') {
    return {
      kind: 'group',
      address: channel.address,
      channelName: channel.channelName,
    };
  }
  if (channel.kind === 'profile') {
    return {
      kind: 'profile',
      address: channel.address,
      name: channel.name,
    };
  }
  return undefined;
}

export async function postChannelMessage(
  author: string,
  text: string,
  channel: ChatChannel,
): Promise<void> {
  await withSession(author, (sessionKey) =>
    postMessage(author, text, sessionKey, targetFromChannel(channel)),
  );
}

export async function postMainMessage(
  author: string,
  text: string,
): Promise<void> {
  await withSession(author, (sessionKey) =>
    postMessage(author, text, sessionKey),
  );
}

export async function deleteMainMessage(
  actor: string,
  key: string,
): Promise<void> {
  await withSession(actor, (sessionKey) =>
    deleteMessage(key, actor, sessionKey),
  );
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

export async function tipUser(
  sender: string,
  recipient: string,
  amount: number,
): Promise<void> {
  const senderAddress = getAddress(sender);
  const recipientAddress = getAddress(recipient);
  const { transactions } = await buildTip(
    senderAddress,
    recipientAddress,
    amount,
  );

  await sendTransactions(transactions.map(formatTxForHost));
}
