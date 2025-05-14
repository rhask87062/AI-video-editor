import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Optional: Configure base if needed for Electron loading
  // base: './',
  build: {
    // Output directory for the React build (relative to root)
    outDir: 'dist-react' 
  }
}); 