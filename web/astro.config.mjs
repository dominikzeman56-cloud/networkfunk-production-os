import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';

export default defineConfig({
  devOptions: {
    port: 4321
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src')
      }
    }
  },
  integrations: [react()]
});