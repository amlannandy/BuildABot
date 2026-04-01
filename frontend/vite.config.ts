import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@apis': '/src/api',
      '@assets': '/src/assets',
      '@components': '/src/components',
      '@constants': '/src/constants',
      '@hooks': '/src/hooks',
      '@pages': '/src/pages',
    }
  }
})
