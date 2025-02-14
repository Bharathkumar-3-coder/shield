import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['regenerator-runtime/runtime']
  },
  resolve: {
    alias: {
      'regenerator-runtime': 'regenerator-runtime'
    }
  }
});