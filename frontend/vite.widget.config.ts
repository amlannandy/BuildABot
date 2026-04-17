import { fileURLToPath } from 'url';
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget/index.tsx'),
      name: 'BuildABotWidget',
      fileName: 'buildabot-widget',
      formats: ['iife'],
    },
    outDir: 'dist-widget',
    rollupOptions: {
      external: [],
    },
    cssCodeSplit: false,
  },
});
