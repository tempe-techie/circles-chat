import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const distDir = path.join(__dirname, 'dist');

app.use(express.static(distDir, { maxAge: '1h', index: false }));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});
app.listen(PORT, () => {
  console.log(`Listening on :${PORT}`);
});
