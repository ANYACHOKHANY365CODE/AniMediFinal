import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AniMedi - Pet Healthcare',
        short_name: 'AniMedi',
        description: 'AniMedi: Pet Healthcare & Wellness Platform',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/assets/images/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/images/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/assets/images/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  worker: {
    format: 'es',
  },
  server: {
    proxy: {
      '/api': 'https://backend-2-e4ub.onrender.com',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})