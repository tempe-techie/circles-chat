import { encodeFunctionData } from 'viem';
import { sendTransactions } from '../host/bridge';
import { chatContextAbi } from './abi';
import { CHAT_CONTRACT_ADDRESS } from './constants';

export function toHexValue(value: bigint): string {
  return value > 0n ? `0x${value.toString(16)}` : '0x0';
}

function formatTxForHost(tx: {
  to: string;
  data: `0x${string}`;
  value: bigint;
}) {
  return {
    to: tx.to,
    data: tx.data,
    value: toHexValue(tx.value),
  };
}

export async function submitTransactions(
  txs: { to: string; data: `0x${string}`; value: bigint }[],
) {
  return sendTransactions(txs.map(formatTxForHost));
}

export function buildCreateMessageTx(url: string, price: bigint) {
  return {
    to: CHAT_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: chatContextAbi,
      functionName: 'createMessage',
      args: [url],
    }),
    value: price,
  };
}

export function buildCreateReplyTx(
  mainMsgIndex: bigint,
  url: string,
  price: bigint,
) {
  return {
    to: CHAT_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: chatContextAbi,
      functionName: 'createReply',
      args: [mainMsgIndex, url],
    }),
    value: price,
  };
}

export function buildDeleteMessageTx(mainMsgIndex: bigint) {
  return {
    to: CHAT_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: chatContextAbi,
      functionName: 'deleteMessage',
      args: [mainMsgIndex],
    }),
    value: 0n,
  };
}

export function buildDeleteReplyTx(
  mainMsgIndex: bigint,
  replyMsgIndex: bigint,
) {
  return {
    to: CHAT_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: chatContextAbi,
      functionName: 'deleteReply',
      args: [mainMsgIndex, replyMsgIndex],
    }),
    value: 0n,
  };
}
