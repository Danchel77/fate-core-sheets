import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/fate-core-sheets/',
  plugins: [react()],
});
