import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative paths so file:// and any static hosting works directly
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
