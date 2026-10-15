import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/FoDeMEEP-RCU/' : '/',
  server: {
    watch: {
      ignored: ['**/mapas_rcu/**', '**/data_raw/**', '**/*.cst', '**/*.shp', '**/*.dbf', '**/*.shx'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globIgnores: ['**/monitor/**', '**/visor-bbdd.html', '**/puente-sync.html'],
        navigateFallbackDenylist: [/\/puente-sync\.html$/, /\/visor-bbdd\.html$/, /\/monitor\//],
      },
      includeAssets: [
        'favicon.ico',
        'favicon.png',
        'favicon-32x32.png',
        'favicon-16x16.png',
        'apple-touch-icon.png',
        'apple-touch-icon-180x180.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],
      manifest: {
        name: 'FoDeMEEP Relevamiento en Campo',
        short_name: 'FoDeMEEP',
        description: 'Herramienta técnica de relevamiento in situ para instituciones educativas de Río Cuarto',
        theme_color: '#009de0',
        background_color: '#0b0f17',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
}));
