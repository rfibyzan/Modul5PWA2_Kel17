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