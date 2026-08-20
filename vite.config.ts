import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'HerdOS Dairy',
        short_name: 'HerdOS',
        description: 'Dairy farm management',
        theme_color: '#0F3D2E',
        background_color: '#F3F0E8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5151,
    strictPort: true,
    allowedHosts: ['localhost', '127.0.0.1', '172.16.3.140'],
    proxy: {
      '/api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/socket.io': { target: 'http://127.0.0.1:4000', ws: true },
    },
  },
});
