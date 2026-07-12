import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

const DUMMY_KEY = 'proxy-secured';

export default defineConfig(({ mode }) => {
  // Load .env variables (server-side only — never bundled into the client)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},

      // ── Dev Proxy ────────────────────────────────────────────────────────────
      // Intercepts /api/data/* in development and forwards to the real backend
      // with the real credentials injected server-side — invisible to the browser.
      proxy: {
        '/api/data': {
          target: env.SUPABASE_URL,
          changeOrigin: true,
          ws: true, // WebSocket for Realtime
          rewrite: (p) => p.replace(/^\/api\/data/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Inject the real API key
              proxyReq.setHeader('apikey', env.SUPABASE_ANON_KEY);

              // Replace the dummy Authorization with the real anon key
              // (only for unauthenticated requests — real JWTs are left untouched)
              const auth = proxyReq.getHeader('Authorization');
              if (auth === `Bearer ${DUMMY_KEY}`) {
                proxyReq.setHeader('Authorization', `Bearer ${env.SUPABASE_ANON_KEY}`);
              }
            });
          }
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor';
              if (id.includes('motion')) return 'motion';
              if (id.includes('lucide')) return 'icons';
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
