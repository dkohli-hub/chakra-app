import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  preview: {
    allowedHosts: ['chakra-app-ui.onrender.com'],
    host: '0.0.0.0',
  },
  server: mode === 'development' ? {
    proxy: {
      '/api': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
    },
  } : {},
}))