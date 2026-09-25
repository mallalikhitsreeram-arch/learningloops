import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  // Base path: root '/' for Vercel & local development, '/learningloops/' only if GITHUB_PAGES is set
  base: process.env.GITHUB_PAGES ? '/learningloops/' : '/',
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  define: {
    // Expose the backend API URL to the frontend bundle
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '')
  }
});
