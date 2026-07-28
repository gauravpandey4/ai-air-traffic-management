import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export const repositoryBase = '/ai-air-traffic-management/';

export default defineConfig({
  base: repositoryBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'FutureATC Lab',
        short_name: 'FutureATC',
        description: 'Academic AI-assisted air traffic management simulator',
        theme_color: '#07111f',
        background_color: '#07111f',
        display: 'standalone',
        start_url: repositoryBase,
        scope: repositoryBase,
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: `${repositoryBase}index.html`,
        globPatterns: ['**/*.{html,js,css,svg,json,woff2}'],
        globIgnores: ['**/data/aircraft-snapshot.json'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    target: 'baseline-widely-available',
    sourcemap: true,
  },
});
