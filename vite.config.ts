import { defineConfig } from 'vite';

export default defineConfig({
  base: '/evacuation-command/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
