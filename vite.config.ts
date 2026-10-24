/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Custom Vite plugin enforcing strict CSP in production bundles.
 * Strips 'unsafe-inline' from script-src during build time while allowing
 * hot reload scripts during local development.
 */
function strictCspPlugin(): Plugin {
  return {
    name: 'strict-csp-production',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        "script-src 'self' 'unsafe-inline'",
        "script-src 'self'"
      );
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), strictCspPlugin()],
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.onrender.com'
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/test/**', 'src/main.tsx', 'src/types/**'],
      thresholds: {
        statements: 70,
        lines: 70,
        functions: 60,
        branches: 60
      }
    }
  }
});
