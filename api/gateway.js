/**
 * api/gateway.js — Secure proxy middleware for the backend database.
 *
 * All browser requests go to /api/data/* (generic, reveals nothing).
 * This module rewrites the path, injects the real credentials server-side,
 * and forwards the request to the real backend. The client never sees the
 * real URL, provider name, or API key.
 */
import { createProxyMiddleware } from 'http-proxy-middleware';

const REAL_TARGET  = process.env.SUPABASE_URL;
const REAL_API_KEY = process.env.SUPABASE_ANON_KEY;
const DUMMY_KEY    = 'proxy-secured'; // the placeholder used by the client bundle

if (!REAL_TARGET || !REAL_API_KEY) {
  console.error(
    '[gateway] ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in ' +
    'environment variables before starting the server.'
  );
}

export const supabaseProxy = createProxyMiddleware({
  target: REAL_TARGET,
  changeOrigin: true,
  ws: true, // WebSocket support for Realtime subscriptions

  pathRewrite: { '^/api/data': '' },

  on: {
    proxyReq: (proxyReq) => {
      // Always inject the real API key — client only has the dummy placeholder.
      proxyReq.setHeader('apikey', REAL_API_KEY);

      // For unauthenticated requests the Supabase client sends:
      //   Authorization: Bearer proxy-secured
      // Replace the dummy with the real anon key so Supabase accepts it.
      // Authenticated requests carry a real JWT — those are left untouched.
      const auth = proxyReq.getHeader('Authorization');
      if (auth === `Bearer ${DUMMY_KEY}`) {
        proxyReq.setHeader('Authorization', `Bearer ${REAL_API_KEY}`);
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
