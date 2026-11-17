import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// O index.html vive em resources/; o código fica em src/, ao lado.
export default defineConfig({
  root: 'resources',
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true },
  test: { root: '.', include: ['tests/**/*.test.ts'], environment: 'node' },
});
