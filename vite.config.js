import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ppe': {
        target: 'https://script.google.com',
        changeOrigin: true,
        secure: true,
        // Everything hitting /api/ppe is forwarded to your Apps Script URL
        rewrite: (path) =>
          '/macros/s/AKfycbwF43ifwW59Cns4vJ6WwZwJlz0pRB5QFUg6ZK12ypNM9SQ967cVSAY_fhhlUOmrElwBzw/exec',
      },
    },
  },
});
