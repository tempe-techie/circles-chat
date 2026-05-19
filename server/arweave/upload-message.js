import Arweave from 'arweave';
import { getEnvVar } from '../utils/env-vars.js';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

const MAX_TEXT_LENGTH = 4000;

function formatArweavePostResponse(response) {
  const errorBody =
    response.data?.error ??
    (typeof response.data === 'string' ? response.data : response.data);
  return {
    status: response.status,
    statusText: response.statusText,
    error: errorBody,
  };
}

async function logArweaveUploadContext(keyFile, transaction, payloadByteLength) {
  try {
    const address = await arweave.wallets.jwkToAddress(keyFile);
    const balanceWinston = await arweave.wallets.getBalance(address);
    const balanceAr = arweave.ar.winstonToAr(balanceWinston);
    console.log('Arweave upload context:', {
      walletAddress: address,
      balanceAr,
      transactionId: transaction.id,
      dataSize: transaction.data_size,
      reward: transaction.reward,
      payloadByteLength,
    });
  } catch (err) {
    console.warn(
      'Arweave upload context: could not load wallet/balance',
      err instanceof Error ? err.message : err,
    );
  }
}

export async function uploadChatMessage({ author, text, timestamp }) {
  const trimmed = text?.trim();
  if (!author || !trimmed) {
    throw new Error('author and text are required');
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    throw new Error(`text must be at most ${MAX_TEXT_LENGTH} characters`);
  }
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    throw new Error('timestamp must be a number');
  }

  const payload = JSON.stringify({
    author,
    text: trimmed,
    timestamp: Math.floor(timestamp),
  });

  const arweaveKeyRaw = await getEnvVar('arweaveKey');
  if (!arweaveKeyRaw) {
    throw new Error('arweaveKey is not configured');
  }

  const keyFile = JSON.parse(arweaveKeyRaw);
  const data = new TextEncoder().encode(payload);

  const transaction = await arweave.createTransaction({ data }, keyFile);
  transaction.addTag('Content-Type', 'application/json');
  transaction.addTag('App', 'circles-chat');

  await arweave.transactions.sign(transaction, keyFile);

  await logArweaveUploadContext(keyFile, transaction, data.byteLength);

  const response = await arweave.transactions.post(transaction);

  if (response.status !== 200) {
    const details = formatArweavePostResponse(response);
    console.error('Arweave upload failed:', details);
    const detailText = [
      details.statusText,
      typeof details.error === 'string'
        ? details.error
        : details.error != null
          ? JSON.stringify(details.error)
          : null,
    ]
      .filter(Boolean)
      .join(' — ');
    throw new Error(
      `Failed to upload to Arweave. Status: ${response.status}${detailText ? ` (${detailText})` : ''}`,
    );
  }

  return transaction.id;
}
