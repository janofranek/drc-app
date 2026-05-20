import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // ensures Google App Engine still serves from 'build'
    chunkSizeWarningLimit: 1200, // increases the limit to 1.2MB to suppress the 500kB warning for our unified vendor bundle
  },
  server: {
    port: 3000,
    open: true
  },


});
