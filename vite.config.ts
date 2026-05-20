import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const REMOTE_API = 'https://circles-chat-22.appspot.com';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: REMOTE_API,
        changeOrigin: true,
      },
    },
  },
});
