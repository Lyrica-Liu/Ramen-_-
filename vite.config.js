import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID ?? ''),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': 'http://localhost:8080',
      },
    },
    build: {
      outDir: 'src/main/resources/static',
      emptyOutDir: true,
    },
  };
});
