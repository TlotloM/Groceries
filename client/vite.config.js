import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// In development, forward /api calls to the Express server (no CORS fuss).
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } },
});