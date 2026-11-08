import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration aligned with existing Docker Compose architecture:
 * - Frontend listening on port 3000 (mapped to ${FRONTEND_PORT}:3000)
 * - Backend API proxied to http://backend:5000 (mapped to ${BACKEND_PORT}:5000)
 * - Supports both VITE_ and legacy REACT_APP_ environment variables
 */
export default defineConfig({
  envPrefix: ['VITE_', 'REACT_APP_'],

  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react(),
  ],

  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },

  server: {
    host: '0.0.0.0',
    port: 3000, // Matches "${FRONTEND_PORT}:3000" in docker-compose.yml
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://backend:5000', // Matches backend service on port 5000
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});