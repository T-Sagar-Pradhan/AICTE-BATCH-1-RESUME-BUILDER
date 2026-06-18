import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react'
            if (id.includes('@tanstack') || id.includes('axios')) return 'vendor-query'
            if (id.includes('framer-motion')) return 'vendor-motion'
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'vendor-forms'
            if (id.includes('lucide-react')) return 'vendor-icons'
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
