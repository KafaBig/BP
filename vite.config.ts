import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/get_all_questions': 'http://localhost:5000',
      '/submit_quiz': 'http://localhost:5000',
      '/start_quiz': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
      '/api': 'http://localhost:5000',
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
  }
});