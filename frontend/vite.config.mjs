import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve('src'),
      '@': path.resolve('src'),
    },
  },
  define: {
    'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'https://fincept-backend.onrender.com/api/v1'),
    'process.env.REACT_APP_AUTH_URL': JSON.stringify(process.env.REACT_APP_AUTH_URL || 'https://fincept-backend.onrender.com/users'),
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
  },
});
