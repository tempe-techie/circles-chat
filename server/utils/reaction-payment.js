import { getAddress } from 'viem';
import { circlesConfig } from '@aboutcircles/sdk-core';
import { TransferBuilder } from '@aboutcircles/sdk-transfers';
import {
  CirclesConverter,
  encodeCrcV2TransferData,
  hexToBytes,
} from '@aboutcircles/sdk-utils';

export const REACTION_CRC_AMOUNT = 1;

export const REACTION_TIP_NOTE =
  "Here's a tip for your message on the Circles Chat";

const config = circlesConfig[100];
const transferBuilder = new TransferBuilder(config);

export async function buildReactionTransfer({ messageAuthor, reactor }) {
  const amount = CirclesConverter.circlesToAttoCircles(REACTION_CRC_AMOUNT);
  const txDataHex = encodeCrcV2TransferData([REACTION_TIP_NOTE], 0x0001);
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
