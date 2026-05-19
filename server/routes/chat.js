import { Router } from 'express';
import { getAddress, isAddress } from 'viem';
import { uploadChatMessage } from '../arweave/upload-message.js';

const router = Router();

router.post('/upload', async (req, res) => {
  try {
    const { author, text, timestamp } = req.body ?? {};

    if (!author || typeof author !== 'string' || !isAddress(author)) {
      return res.status(400).json({ error: 'Invalid author address' });
    }

    const checksummed = getAddress(author);

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const ts =
      typeof timestamp === 'number'
        ? timestamp
        : typeof timestamp === 'string'
          ? Number(timestamp)
          : NaN;

    if (!Number.isFinite(ts)) {
      return res.status(400).json({ error: 'timestamp must be a number' });
    }

    const transactionId = await uploadChatMessage({
      author: checksummed,
      text,
      timestamp: ts,
    });

    return res.json({ transactionId });
  } catch (err) {
    console.error('Chat upload error:', err);
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
});

export default router;
