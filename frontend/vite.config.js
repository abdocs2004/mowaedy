import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API runs on :5000. The proxy keeps everything same-origin,
// so the httpOnly auth cookie works without any CORS/cookie tweaks.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000', changeOrigin: true } },
  },
  build: { chunkSizeWarningLimit: 700 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    testTimeout: 30000,
    env: { VITE_API_URL: process.env.TEST_API_URL || 'http://127.0.0.1:5000/api' },
  },
});
