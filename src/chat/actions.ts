import { getAddress } from 'viem';
import { sendTransactions, signMessage } from '../host/bridge';
import {
  buildMessageReaction,
  confirmMessageReaction,
  deleteMessage,
  postMessage,
} from './api';
import {
  DELETE_SIGN_PREFIX,
  REACTION_CONFIRM_MAX_ATTEMPTS,
  REACTION_CONFIRM_POLL_MS,
} from './constants';

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const { paymentData, transactions } = await buildMessageReaction(
    messageKey,
    reactorAddress,
  );

  await sendTransactions(transactions.map(formatTxForHost));

  for (let attempt = 0; attempt < REACTION_CONFIRM_MAX_ATTEMPTS; attempt += 1) {
    const result = await confirmMessageReaction(
      messageKey,
      reactorAddress,
      paymentData,
    );

    if (result.status === 'ready') return;
    if (result.status === 'expired') {
      throw new Error('Reaction payment expired before it was confirmed');
    }

    await sleep(REACTION_CONFIRM_POLL_MS);
  }

  throw new Error(
    'Reaction payment is still pending. It may appear after the transfer is indexed.',
  );
}
