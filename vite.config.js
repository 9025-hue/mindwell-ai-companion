import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Explicitly tell Rollup to treat Firebase modules as external
      // This prevents Rollup from trying to bundle them, assuming they'll be
      // available in the environment (e.g., from CDN or Firebase SDK scripts).
      external: ['firebase/app', 'firebase/auth']
    }
  }
})
