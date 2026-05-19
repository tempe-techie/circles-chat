import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { getAddress } from 'viem';
import { circlesConfig } from '@aboutcircles/sdk-core';
import { CirclesRpc } from '@aboutcircles/sdk-rpc';
import { TransferBuilder } from '@aboutcircles/sdk-transfers';
import {
  CirclesConverter,
  encodeCrcV2TransferData,
  hexToBytes,
} from '@aboutcircles/sdk-utils';
import { getEnvVar } from './env-vars.js';

const PAYMENT_PREFIX = 'crc-reaction';
const PAYMENT_VERSION = 1;
const PAYMENT_TTL_SEC = 3600;
export const REACTION_CRC_AMOUNT = 1;

const config = circlesConfig[100];
const rpc = new CirclesRpc(config.circlesRpcUrl);
const transferBuilder = new TransferBuilder(config);

let hmacSecretPromise;

async function getHmacSecret() {
  if (!hmacSecretPromise) {
    hmacSecretPromise = (async () => {
      const fromEnv = await getEnvVar('REACTION_HMAC_SECRET');
      if (fromEnv) return fromEnv;
      if (process.env.MYLOCALHOST) {
        return (
          process.env.REACTION_HMAC_SECRET ??
          'dev-reaction-hmac-secret-local-only'
        );
      }
      throw new Error('REACTION_HMAC_SECRET is not configured');
    })();
  }
  return hmacSecretPromise;
}

function base64urlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64urlDecode(value) {
  const padded =
    value.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded, 'base64');
}

function signPayload(payloadB64, secret) {
  return createHmac('sha256', secret).update(payloadB64).digest('hex');
}

export function createReactionPaymentData({ messageId, reactor, expiry }) {
  const payload = {
    v: PAYMENT_VERSION,
    m: messageId,
    b: getAddress(reactor),
    x: expiry,
    n: randomBytes(16).toString('hex'),
  };
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  return `${PAYMENT_PREFIX}.${payloadB64}`;
}

export async function finalizeReactionPaymentData(paymentDataBase) {
  const secret = await getHmacSecret();
  const signature = signPayload(paymentDataBase, secret);
  return `${paymentDataBase}.${signature}`;
}

export function parseReactionPaymentData(paymentData) {
  if (typeof paymentData !== 'string' || !paymentData.startsWith(`${PAYMENT_PREFIX}.`)) {
    throw new Error('Invalid payment data');
  }

  const parts = paymentData.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid payment data format');
  }

  const [, payloadB64, signature] = parts;
  const payloadJson = base64urlDecode(payloadB64).toString('utf8');
  const payload = JSON.parse(payloadJson);

  if (payload.v !== PAYMENT_VERSION) {
    throw new Error('Unsupported payment version');
  }

  return {
    payload,
    payloadB64,
    signature,
    messageId: payload.m,
    reactor: getAddress(payload.b),
    expiry: payload.x,
    nonce: payload.n,
  };
}

export async function verifyReactionPaymentData(paymentData) {
  const parsed = parseReactionPaymentData(paymentData);
  const secret = await getHmacSecret();
  const expected = signPayload(parsed.payloadB64, secret);

  const a = Buffer.from(parsed.signature, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('Invalid payment signature');
  }

  if (typeof parsed.expiry !== 'number' || parsed.expiry < Math.floor(Date.now() / 1000)) {
    throw new Error('Payment intent expired');
  }

  return parsed;
}

function paymentDataMatchesEventData(paymentData, eventData) {
  const candidates = new Set([paymentData]);

  if (typeof eventData === 'string') {
    candidates.add(eventData);
    if (eventData.startsWith('0x')) {
      try {
        const decoded = Buffer.from(eventData.slice(2), 'hex').toString('utf8');
        candidates.add(decoded);
      } catch {
        /* ignore */
      }
    }
    try {
      const transferHex = encodeCrcV2TransferData([paymentData], 0x0001);
      candidates.add(transferHex);
      candidates.add(transferHex.toLowerCase());
    } catch {
      /* ignore */
    }
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (eventData === candidate) return true;
    if (typeof eventData === 'string' && eventData.includes(paymentData)) {
      return true;
    }
  }

  return false;
}

export async function findMatchingReactionTransfer({
  paymentData,
  recipient,
  reactor,
}) {
  const limit = 100;
  let cursor = null;

  for (let page = 0; page < 5; page += 1) {
    const result = await rpc.query.events(
      getAddress(recipient),
      null,
      null,
      ['CrcV2_TransferData'],
      null,
      false,
      limit,
      cursor,
    );

    for (const event of result.events ?? []) {
      const row = event?.event ?? event;
      const to = row?.to ?? row?.To;
      const from = row?.from ?? row?.From ?? row?.operator ?? row?.Operator;
      const data = row?.data ?? row?.Data;

      if (!to || !data) continue;
      if (getAddress(to) !== getAddress(recipient)) continue;
      if (from && getAddress(from) !== getAddress(reactor)) continue;
      if (!paymentDataMatchesEventData(paymentData, data)) continue;

      return event;
    }

    if (!result.hasMore || !result.nextCursor) break;
    cursor = result.nextCursor;
  }

  return null;
}

export async function buildReactionTransfer({ messageAuthor, reactor, paymentData }) {
  const amount = CirclesConverter.circlesToAttoCircles(REACTION_CRC_AMOUNT);
  const txDataHex = encodeCrcV2TransferData([paymentData], 0x0001);
  const txData = hexToBytes(txDataHex);

  const txs = await transferBuilder.constructAdvancedTransfer(
    getAddress(reactor),
    getAddress(messageAuthor),
    amount,
    { txData },
  );

  return txs.map((tx) => ({
    to: tx.to,
    data: tx.data,
    value: tx.value.toString(),
  }));
}

export function reactionPaymentExpiry() {
  return Math.floor(Date.now() / 1000) + PAYMENT_TTL_SEC;
}
