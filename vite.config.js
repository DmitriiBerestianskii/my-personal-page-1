// vite.config.js
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
// config options
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: '[name]-[hash][extname]',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
      },
    },
  },
});
