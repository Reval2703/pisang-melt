import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(
        new URL('./', import.meta.url)
      ),
    },
  },

  server: {
    host: '0.0.0.0',

    hmr:
      process.env.DISABLE_HMR !== 'true',

    watch:
      process.env.DISABLE_HMR === 'true'
        ? null
        : {},

    allowedHosts: true,
  },

  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});