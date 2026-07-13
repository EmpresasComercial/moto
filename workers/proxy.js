/**
 * workers/proxy.js — Cloudflare Worker Proxy
 *
 * All /api/data/* requests are intercepted here.
 * Real Supabase credentials are injected server-side via Secrets.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── Health check ──────────────────────────────────────────────────────────
    if (url.pathname === '/api/data/health') {
      return new Response('Healthy', { status: 200 });
    }

    // ── Proxy all /api/data/* → Supabase ──────────────────────────────────────
    if (url.pathname.startsWith('/api/data/')) {
      const SUPABASE_URL = env.SUPABASE_URL;
      const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return new Response(JSON.stringify({ error: 'Service configuration error.' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Strip /api/data prefix → get the real Supabase path
      const supabasePath = url.pathname.replace(/^\/api\/data\/?/, '');
      
      // Replace dummy apikey in query string for WebSocket/Realtime requests
      let search = url.search;
      if (search.includes('apikey=proxy-secured')) {
        search = search.replace('apikey=proxy-secured', `apikey=${SUPABASE_ANON_KEY}`);
      }
      
      const targetUrl = `${SUPABASE_URL}/${supabasePath}${search}`;

      // Build forwarded headers
      const SKIP = ['host', 'connection', 'transfer-encoding', 'x-client-info', 'x-supabase-api-version'];
      const forwardHeaders = new Headers();
      for (const [key, value] of request.headers.entries()) {
        if (!SKIP.includes(key.toLowerCase())) {
          forwardHeaders.set(key, value);
        }
      }

      // Inject real API key
      forwardHeaders.set('apikey', SUPABASE_ANON_KEY);

      // Replace dummy Authorization for unauthenticated requests
      if (forwardHeaders.get('authorization') === 'Bearer proxy-secured') {
        forwardHeaders.set('authorization', `Bearer ${SUPABASE_ANON_KEY}`);
      }

      const upstreamResponse = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'follow',
      });

      // Strip sensitive response headers
      const STRIP_RESP = [
        'sb-project-ref', 'sb-gateway-version', 'sb-auth-user-id',
        'sb-auth-session-id', 'sb-auth-refresh-token-prefix', 'sb-request-id',
        'sb-edge-region', 'x-sb-edge-region', 'x-served-by',
        'x-supabase-api-version', 'x-deno-execution-id',
        'x-envoy-attempt-count', 'x-envoy-upstream-service-time',
        'endpoint-load-metrics', 'set-cookie',
      ];
      const responseHeaders = new Headers();
      for (const [key, value] of upstreamResponse.headers.entries()) {
        if (!STRIP_RESP.includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      }

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: responseHeaders,
      });
    }

    // ── Everything else → serve static assets (SPA) ───────────────────────────
    // Cloudflare Workers Assets handles this automatically when assets is configured
    return env.ASSETS.fetch(request);
  },
};
