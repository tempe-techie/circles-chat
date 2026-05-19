import { MAX_MESSAGE_LENGTH } from './constants';

export async function uploadMessage(
  author: string,
  text: string,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty');
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message must be at most ${MAX_MESSAGE_LENGTH} characters`);
  }

  const res = await fetch('/api/chat/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author,
      text: trimmed,
      timestamp: Math.floor(Date.now() / 1000),
    }),
  });

  const data = (await res.json()) as {
    transactionId?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? 'Upload failed');
  }

  if (!data.transactionId) {
    throw new Error('No transaction ID returned');
  }

  return data.transactionId;
}
