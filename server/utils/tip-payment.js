import { getAddress } from 'viem';
import { circlesConfig } from '@aboutcircles/sdk-core';
import { TransferBuilder } from '@aboutcircles/sdk-transfers';
import {
  CirclesConverter,
  encodeCrcV2TransferData,
  hexToBytes,
} from '@aboutcircles/sdk-utils';

export const TIP_MIN_CRC_AMOUNT = 1;

export const TIP_MAX_CRC_AMOUNT = 1000;

export const TIP_NOTE = "Here's a tip for you on the Circles Chat!";

const config = circlesConfig[100];
const transferBuilder = new TransferBuilder(config);

export function normalizeTipAmount(rawAmount) {
  const amount =
    typeof rawAmount === 'number' ? rawAmount : Number(rawAmount);

  if (!Number.isFinite(amount)) {
    throw new Error('Tip amount must be a number');
  }
  if (amount < TIP_MIN_CRC_AMOUNT) {
    throw new Error(`Tip must be at least ${TIP_MIN_CRC_AMOUNT} CRC`);
  }
  if (amount > TIP_MAX_CRC_AMOUNT) {
    throw new Error(`Tip cannot exceed ${TIP_MAX_CRC_AMOUNT} CRC`);
  }

  return amount;
}

export async function buildTipTransfer({ sender, recipient, amount }) {
  const normalizedAmount = normalizeTipAmount(amount);
  const attoAmount =
    CirclesConverter.circlesToAttoCircles(normalizedAmount);
  const txDataHex = encodeCrcV2TransferData([TIP_NOTE], 0x0001);
  const txData = hexToBytes(txDataHex);

  const txs = await transferBuilder.constructAdvancedTransfer(
    getAddress(sender),
    getAddress(recipient),
    attoAmount,
    { txData, useWrappedBalances: true },
  );

  return txs.map((tx) => ({
    to: tx.to,
    data: tx.data,
    value: tx.value.toString(),
  }));
}
