import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png',
      ],
      manifest: {
        name: 'ManawiBandung — Rute Bus & Angkot Bandung',
        short_name: 'ManawiBandung',
        description:
          'Cek rute 54 jalur MJT, TMB, dan Angkot Bandung, jadwal keberangkatan, estimasi hemat vs ojol, cuaca BMKG, serta simulasi di peta — bade kamana manawi?',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#F4F8FF',
        theme_color: '#004AAD',
        categories: ['navigation', 'travel', 'utilities'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Jangan pernah alihkan request API (seperti /api/bmkg) ke index.html
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /\/api\/bmkg/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'bmkg-weather',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 15,
                maxAgeSeconds: 60 * 20,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ],
      },
    }),
  ],
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
