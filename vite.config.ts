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
          ws: true,
          rewrite: (p) => p.replace(/^\/api\/data/, ''),
          configure: (proxy) => {
            // Headers that reveal the provider — stripped from outgoing requests
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('apikey', env.SUPABASE_ANON_KEY);
              const auth = proxyReq.getHeader('Authorization');
              if (auth === `Bearer ${DUMMY_KEY}`) {
                proxyReq.setHeader('Authorization', `Bearer ${env.SUPABASE_ANON_KEY}`);
              }
              proxyReq.removeHeader('x-client-info');
              proxyReq.removeHeader('x-supabase-api-version');
            });

            // Headers that reveal the provider — stripped from incoming responses
            const REMOVE = [
              'sb-project-ref', 'sb-gateway-version', 'sb-auth-user-id',
              'sb-auth-session-id', 'sb-auth-refresh-token-prefix', 'sb-request-id',
              'sb-edge-region', 'x-sb-edge-region', 'x-served-by',
              'x-supabase-api-version', 'x-deno-execution-id',
              'x-envoy-attempt-count', 'x-envoy-upstream-service-time',
              'endpoint-load-metrics',
            ];
            proxy.on('proxyRes', (proxyRes) => {
              REMOVE.forEach(h => { delete proxyRes.headers[h]; });

              // Clean headers that list allowed names — remove Supabase-specific terms
              const cleanHeaderList = (headerName) => {
                const val = proxyRes.headers[headerName];
                if (!val) return;
                const cleaned = String(val).split(',').map(h => h.trim())
                  .filter(h => !['x-client-info', 'apikey'].includes(h.toLowerCase())
                    && !h.toLowerCase().includes('supabase'))
                  .join(', ');
                if (cleaned) proxyRes.headers[headerName] = cleaned;
                else delete proxyRes.headers[headerName];
              };
              cleanHeaderList('access-control-expose-headers');
              cleanHeaderList('access-control-allow-headers');

              // Strip set-cookie headers that contain supabase.co domain
              const cookies = proxyRes.headers['set-cookie'];
              if (cookies) {
                const list = Array.isArray(cookies) ? cookies : [cookies];
                const safe = list.filter(c => !c.toLowerCase().includes('supabase.co'));
                if (safe.length > 0) proxyRes.headers['set-cookie'] = safe;
                else delete proxyRes.headers['set-cookie'];
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
