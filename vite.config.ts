import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api/bmkg': {
        target: 'https://api.bmkg.go.id',
        changeOrigin: true,
        rewrite: (reqPath) => reqPath.replace(/^\/api\/bmkg/, '/publik/prakiraan-cuaca'),
      },
    },
  },
  preview: {
    proxy: {
      '/api/bmkg': {
        target: 'https://api.bmkg.go.id',
        changeOrigin: true,
        rewrite: (reqPath) => reqPath.replace(/^\/api\/bmkg/, '/publik/prakiraan-cuaca'),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'zustand', 'zod'],
          'vendor-motion': ['framer-motion'],
          'vendor-heroui': ['@heroui/react'],
        },
      },
    },
  },
});
