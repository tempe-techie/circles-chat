import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadModerators } from './server/datastore/moderators.js';
import chatRouter from './server/routes/chat.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const distDir = path.join(__dirname, 'dist');

app.use(express.json({ limit: '64kb' }));
app.use('/api/chat', chatRouter);

app.use(express.static(distDir, { maxAge: '1h', index: false }));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

async function start() {
  await loadModerators();
  app.listen(PORT, () => {
    console.log(`Listening on :${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
