import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-framer': ['framer-motion'],
          'vendor-konva': ['konva', 'react-konva'],
          'vendor-i18n': ['i18next', 'react-i18next'],
        }
      }
    }
  },
  server: {
    proxy: {
      '/replicate-api': {
        target: 'https://api.replicate.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/replicate-api/, '')
      }
    }
  },
  preview: {
    allowedHosts: true,
    host: true, 
    port: 5174
  }
})
