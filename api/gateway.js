/**
 * api/gateway.js — Secure proxy middleware for the backend database.
 *
 * All browser requests go to /api/data/* (generic, reveals nothing).
 * This module:
 *   1. Injects real credentials server-side (client only has dummy values)
 *   2. Strips request headers that reveal the library/provider name
 *   3. Strips response headers that reveal the backend provider or project ID
 */
import { createProxyMiddleware } from 'http-proxy-middleware';

const REAL_TARGET  = process.env.SUPABASE_URL;
const REAL_API_KEY = process.env.SUPABASE_ANON_KEY;
const DUMMY_KEY    = 'proxy-secured';

// Response headers returned by the backend that must never reach the browser
const RESPONSE_HEADERS_TO_REMOVE = [
  'sb-project-ref',              // reveals the project ID
  'sb-gateway-version',
  'sb-auth-user-id',
  'sb-auth-session-id',
  'sb-auth-refresh-token-prefix',
  'sb-request-id',
  'sb-edge-region',
  'x-sb-edge-region',            // "sb" prefix reveals Supabase
  'x-served-by',                 // contains "supabase-edge-runtime"
  'x-supabase-api-version',      // reveals provider name
  'x-deno-execution-id',         // reveals Deno / Edge Functions tech
  'x-envoy-attempt-count',
  'x-envoy-upstream-service-time',
  'endpoint-load-metrics',       // internal infrastructure metrics
];

if (!REAL_TARGET || !REAL_API_KEY) {
  console.error(
    '[gateway] ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in ' +
    'environment variables before starting the server.'
  );
}

export const supabaseProxy = createProxyMiddleware({
  target: REAL_TARGET,
  changeOrigin: true,
  ws: true,
  pathRewrite: { '^/api/data': '' },

  on: {
    // ── Outgoing request → backend ─────────────────────────────────────────
    proxyReq: (proxyReq) => {
      // Inject the real API key
      proxyReq.setHeader('apikey', REAL_API_KEY);

      // Replace dummy Authorization for unauthenticated requests
      const auth = proxyReq.getHeader('Authorization');
      if (auth === `Bearer ${DUMMY_KEY}`) {
        proxyReq.setHeader('Authorization', `Bearer ${REAL_API_KEY}`);
      }

      // Strip headers added by the supabase-js library that reveal provider info
      proxyReq.removeHeader('x-client-info');        // e.g. "supabase-js-web/2.x"
      proxyReq.removeHeader('x-supabase-api-version');
    },

    // ── Incoming response → browser ────────────────────────────────────────
    proxyRes: (proxyRes) => {
      // Remove all headers that reveal the backend provider or project ID
      RESPONSE_HEADERS_TO_REMOVE.forEach(h => {
        delete proxyRes.headers[h];
      });

      // Clean headers that list allowed header names and may mention Supabase
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

      // Strip set-cookie headers that expose "supabase.co" in the Domain field
      const cookies = proxyRes.headers['set-cookie'];
      if (cookies) {
        const list = Array.isArray(cookies) ? cookies : [cookies];
        const safe = list.filter(c => !c.toLowerCase().includes('supabase.co'));
        if (safe.length > 0) {
          proxyRes.headers['set-cookie'] = safe;
        } else {
          delete proxyRes.headers['set-cookie'];
        }
      }
    },

    error: (_err, _req, res) => {
      if (res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Service temporarily unavailable.' }));
      }
    }
  }
});
