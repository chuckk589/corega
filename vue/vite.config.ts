import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3001,
    https: false,
    host: true,
    proxy: {
      '/v1': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
      },
      '/files': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
      },
    },
  },
  plugins: [vue(), vueJsx(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: '../dist/public',
  },
});
