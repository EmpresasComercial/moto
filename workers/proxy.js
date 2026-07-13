export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/data/health') {
      return new Response('Healthy', { status: 200 });
    }

    if (url.pathname.startsWith('/api/data/')) {
      const SUPABASE_URL = env.SUPABASE_URL;
      const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return new Response(JSON.stringify({ error: 'Service configuration error.' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const supabasePath = url.pathname.replace(/^\/api\/data\/?/, '');

      let search = url.search;
      if (search.includes('apikey=proxy-secured')) {
        search = search.replace('apikey=proxy-secured', `apikey=${SUPABASE_ANON_KEY}`);
      }

      const isWebSocket = request.headers.get('upgrade') === 'websocket';

      if (isWebSocket) {
        const wsBase = SUPABASE_URL.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
        const targetUrl = `${wsBase}/${supabasePath}${search}`;

        const SKIP_WS = ['host', 'transfer-encoding', 'x-client-info', 'x-supabase-api-version'];
        const wsHeaders = {};
        for (const [key, value] of request.headers.entries()) {
          if (!SKIP_WS.includes(key.toLowerCase())) {
            wsHeaders[key] = value;
          }
        }
        wsHeaders['apikey'] = SUPABASE_ANON_KEY;
        if (wsHeaders['authorization'] === 'Bearer proxy-secured') {
          wsHeaders['authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
        }

        const [client, server] = Object.values(new WebSocketPair());
        const upstream = new WebSocket(targetUrl, { headers: wsHeaders });

        server.accept();

        upstream.addEventListener('message', (event) => {
          try { server.send(event.data); } catch {}
        });
        server.addEventListener('message', (event) => {
          try { upstream.send(event.data); } catch {}
        });
        upstream.addEventListener('close', (event) => {
          try { server.close(event.code, event.reason); } catch {}
        });
        server.addEventListener('close', (event) => {
          try { upstream.close(event.code, event.reason); } catch {}
        });
        upstream.addEventListener('error', () => {
          try { server.close(1011, 'upstream error'); } catch {}
        });

        return new Response(null, { status: 101, webSocket: client });
      }

      const targetUrl = `${SUPABASE_URL}/${supabasePath}${search}`;

      const SKIP = ['host', 'connection', 'transfer-encoding', 'x-client-info', 'x-supabase-api-version'];
      const forwardHeaders = new Headers();
      for (const [key, value] of request.headers.entries()) {
        if (!SKIP.includes(key.toLowerCase())) {
          forwardHeaders.set(key, value);
        }
      }

      forwardHeaders.set('apikey', SUPABASE_ANON_KEY);
      if (forwardHeaders.get('authorization') === 'Bearer proxy-secured') {
        forwardHeaders.set('authorization', `Bearer ${SUPABASE_ANON_KEY}`);
      }

      const upstreamResponse = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'follow',
      });

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

    return env.ASSETS.fetch(request);
  },
};
