import { getAddress } from 'viem';
import { circlesConfig } from '@aboutcircles/sdk-core';
import { TransferBuilder } from '@aboutcircles/sdk-transfers';
import {
  CirclesConverter,
  encodeCrcV2TransferData,
  hexToBytes,
} from '@aboutcircles/sdk-utils';

export const REACTION_CRC_AMOUNT = 1;

export const REACTION_TIP_MESSAGE_PREVIEW_LEN = 50;

export const REACTION_TIP_NOTE_PREFIX =
  "Here's a tip for this message on the Circles Chat: ";

export function buildReactionTipNote(messageText) {
  const preview = String(messageText ?? '').slice(
    0,
    REACTION_TIP_MESSAGE_PREVIEW_LEN,
  );
  return `${REACTION_TIP_NOTE_PREFIX}${preview}`;
}

const config = circlesConfig[100];
const transferBuilder = new TransferBuilder(config);

export async function buildReactionTransfer({
  messageAuthor,
  reactor,
  messageText,
}) {
  const amount = CirclesConverter.circlesToAttoCircles(REACTION_CRC_AMOUNT);
  const note = buildReactionTipNote(messageText);
  const txDataHex = encodeCrcV2TransferData([note], 0x0001);
  const txData = hexToBytes(txDataHex);

  const txs = await transferBuilder.constructAdvancedTransfer(
    getAddress(reactor),
    getAddress(messageAuthor),
    amount,
    { txData, useWrappedBalances: true },
  );

  return txs.map((tx) => ({
    to: tx.to,
    data: tx.data,
    value: tx.value.toString(),
  }));
}
