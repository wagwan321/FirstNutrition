import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // Installable app: home-screen icon, full-screen launch, and the shop keeps
    // working offline (app shell precached, product photos cached as viewed).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'images/fn/site/logo.svg'],
      manifest: {
        name: 'First Nutrition',
        short_name: 'First Nutrition',
        description: 'Official sports supplements, delivered across Jordan and Lebanon. Cash on delivery.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ECEBEA',
        theme_color: '#FFFFFF',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Track food', url: '/coach?view=today', icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
          { name: 'Coach', url: '/coach?view=chat', icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
          { name: 'Offers', url: '/shop/bundles', icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,webp,png}'],
        // product and brand photos are cached as they are viewed, not up front
        globIgnores: ['images/**', 'pwa-*.png'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        runtimeCaching: [{
          urlPattern: ({ url }) => url.pathname.startsWith('/images/'),
          handler: 'CacheFirst',
          options: { cacheName: 'fn-images', expiration: { maxEntries: 400, maxAgeSeconds: 30 * 24 * 3600 } },
        }],
      },
    }),
  ],
})
