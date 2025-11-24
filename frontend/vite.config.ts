// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // ==========================================================
  // ДОДАНО: КОНФІГУРАЦІЯ ПРОКСІ
  // ==========================================================
  server: {
    // Встановлюємо проксі-правила
    proxy: {
      // Перехоплюємо всі запити, що починаються з '/api/v1'
      // Наприклад: http://localhost:5173/api/v1/candidate/get-all
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        
      },
    },
  },
  // ==========================================================
});