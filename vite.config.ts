import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

const DUMMY_KEY = 'proxy-secured';

export default defineConfig(({ mode }) => {
  // Load .env variables (server-side only — never bundled into the client)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        // ── Intercetação local (npm run dev) F-07 ────────────────────────────
        // O proxy do Vite consome as requisições antes do Cloudflare Worker.
        // Precisamos simular a conversão do "phone" para "email" localmente.
        name: 'local-auth-proxy-body',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.includes('/api/data/auth/v1/') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', () => {
                try {
                  let bodyObj = JSON.parse(body);
                  if (bodyObj.phone && !bodyObj.email) {
                    bodyObj.email = `${bodyObj.phone}@user.com`;
                    delete bodyObj.phone;
                  } else if (bodyObj.email && typeof bodyObj.email === 'string' && !bodyObj.email.includes('@')) {
                    bodyObj.email = `${bodyObj.email}@user.com`;
                  }
                  req.rawBody = JSON.stringify(bodyObj);
                } catch (e) {
                  req.rawBody = body;
                }
                next();
              });
            } else {
              next();
            }
          });
        }
      }
    ],
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
          target: env.VITE_SUPABASE_URL || env.SUPABASE_URL,
          changeOrigin: true,
          ws: true,
          rewrite: (p) => p.replace(/^\/api\/data/, ''),
          configure: (proxy) => {
            // Headers that reveal the provider — stripped from outgoing requests
            proxy.on('proxyReq', (proxyReq, req: any) => {
              proxyReq.setHeader('apikey', env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY);
              const auth = proxyReq.getHeader('Authorization');
              if (auth === `Bearer ${DUMMY_KEY}`) {
                proxyReq.setHeader('Authorization', `Bearer ${env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY}`);
              }
              proxyReq.removeHeader('x-client-info');
              proxyReq.removeHeader('x-supabase-api-version');

              // Se interceptámos e consumimos o stream do body, escrever de volta!
              if (req.rawBody) {
                proxyReq.setHeader('Content-Length', Buffer.byteLength(req.rawBody));
                proxyReq.write(req.rawBody);
                // Como o stream original já foi consumido, o http-proxy não receberá o evento 'end'.
                // Fechar o stream manualmente!
                proxyReq.end();
              }
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

            // Handle network drops gracefully
            proxy.on('error', (err, _req, res) => {
              console.warn(`[Proxy Warning] Falha na rede ao conectar ao Supabase: ${err.message}`);
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Falha temporária de rede com o servidor.' }));
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
