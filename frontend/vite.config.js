import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// API_TARGET is injected by docker-compose; falls back to localhost for bare-metal dev
const apiTarget = process.env.API_TARGET || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // required for Docker port binding
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
