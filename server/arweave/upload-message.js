import Arweave from 'arweave';
import { getEnvVar } from '../utils/env-vars.js';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

const MAX_TEXT_LENGTH = 4000;

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

  const response = await arweave.transactions.post(transaction);

  if (response.status !== 200) {
    throw new Error(
      `Failed to upload to Arweave. Status: ${response.status}`,
    );
  }

  return transaction.id;
}
