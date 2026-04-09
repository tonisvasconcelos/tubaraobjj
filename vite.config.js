import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || '/',
  build: {
    target: 'es2019',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})
