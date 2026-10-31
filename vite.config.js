import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const rootDir = import.meta.dirname || path.resolve()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['favicon.ico', 'guns/*.svg', 'logo.png', 'icon-192.png', 'icon-512.png', 'icon.svg'],
      manifest: {
        name: 'Bore & Barrel',
        short_name: 'Bore & Barrel',
        description: 'A small armory — pistols, rifles, and shotguns.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f2f4f5',
        theme_color: '#f2f4f5',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        runtimeCaching: [
          {
            // Cache images with CacheFirst strategy for 0 B transferred on reload
            urlPattern: ({ request, url }) =>
              request.destination === 'image' ||
              /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
          {
            // Cache API queries (Supabase & REST) with NetworkFirst
            urlPattern: ({ url }) =>
              url.pathname.includes('/rest/v1/') ||
              url.pathname.includes('/api/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 1 Day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@components': path.resolve(rootDir, './src/components'),
      '@pages': path.resolve(rootDir, './src/pages'),
      '@hooks': path.resolve(rootDir, './src/hooks'),
      '@services': path.resolve(rootDir, './src/services'),
      '@utils': path.resolve(rootDir, './src/utils'),
      '@context': path.resolve(rootDir, './src/context'),
      '@lib': path.resolve(rootDir, './src/lib'),
    },
  },
})
