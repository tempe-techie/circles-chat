import { uploadMessage } from './api';
import { getPostPrice } from './client';
import {
  buildCreateMessageTx,
  buildCreateReplyTx,
  buildDeleteMessageTx,
  buildDeleteReplyTx,
  submitTransactions,
} from './transactions';

export async function postMainMessage(
  author: string,
  text: string,
): Promise<void> {
  const transactionId = await uploadMessage(author, text);
  const url = `ar://${transactionId}`;
  const price = await getPostPrice();
  await submitTransactions([buildCreateMessageTx(url, price)]);
}

export async function postReply(
  author: string,
  mainMsgIndex: bigint,
  text: string,
): Promise<void> {
  const transactionId = await uploadMessage(author, text);
  const url = `ar://${transactionId}`;
  const price = await getPostPrice();
  await submitTransactions([buildCreateReplyTx(mainMsgIndex, url, price)]);
}

export async function deleteMainMessage(mainMsgIndex: bigint): Promise<void> {
  await submitTransactions([buildDeleteMessageTx(mainMsgIndex)]);
}

export async function deleteReplyMessage(
  mainMsgIndex: bigint,
  replyMsgIndex: bigint,
): Promise<void> {
  await submitTransactions([
    buildDeleteReplyTx(mainMsgIndex, replyMsgIndex),
  ]);
}
