export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── Intercetação das rotas de Auth (F-07) ────────────────────────────────
    // O frontend envia apenas o número de telefone no campo "email".
    // O proxy acrescenta "@user.com" de forma invisível antes de encaminhar
    // para o Supabase Auth. O utilizador nunca vê esta transformação no DevTools.
    const isAuthRoute =
      url.pathname.startsWith('/api/data/auth/v1/token') ||
      url.pathname.startsWith('/api/data/auth/v1/signup') ||
      url.pathname.startsWith('/api/data/auth/v1/recover') ||
      url.pathname.startsWith('/api/data/auth/v1/user');

    if (isAuthRoute && request.method === 'POST') {
      let bodyText = '';
      try {
        bodyText = await request.text();
      } catch (_) { /* silent */ }

      let bodyObj;
      let isJson = false;
      try {
        bodyObj = JSON.parse(bodyText);
        isJson = true;
      } catch (_) { /* não é JSON, passa adiante sem modificar */ }

      // Se o payload tiver "phone" (e não "email"), o frontend está a tentar fazer login com telefone
      // Transformamos isso de volta para a estrutura que o Supabase Auth espera (email = phone@user.com)
      if (isJson && bodyObj && typeof bodyObj.phone === 'string' && !bodyObj.email) {
        bodyObj.email = `${bodyObj.phone}@user.com`;
        delete bodyObj.phone;
        bodyText = JSON.stringify(bodyObj);
      } else if (isJson && bodyObj && typeof bodyObj.email === 'string' && !bodyObj.email.includes('@')) {
        // Fallback antigo por segurança
        bodyObj.email = `${bodyObj.email}@user.com`;
        bodyText = JSON.stringify(bodyObj);
      }

      // Recriar o Request com o corpo modificado e continuar para o bloco /api/data/ abaixo
      request = new Request(request, { body: bodyText });
    }

    // ── Endpoint de saúde / IP do cliente (F-09) ─────────────────────────────
    if (url.pathname === '/api/data/health') {
      // Devolver IP real do cliente via Cloudflare (sem serviços externos).
      // O registo lê este header em vez de chamar api.ipify.org.
      const clientIp =
        request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
        'unknown';
      return new Response('Healthy', {
        status: 200,
        headers: { 'x-client-ip': clientIp },
      });
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

      // ── Bloquear acesso direto à base de dados (REST/GraphQL) ─────────────
      if (
        url.pathname.startsWith('/api/data/rest/v1/') ||
        url.pathname.startsWith('/api/data/graphql/v1/')
      ) {
        return new Response(
          JSON.stringify({ error: 'Database direct access is disabled for security reasons.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

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

      let responseBody = upstreamResponse.body;

      // ── Limpeza da resposta de Auth (F-07) ─────────────────────────────────
      // Se for uma rota de auth, remover o e-mail falso do corpo da resposta
      if (isAuthRoute && upstreamResponse.headers.get('content-type')?.includes('application/json')) {
        try {
          const respText = await upstreamResponse.text();
          let respObj = JSON.parse(respText);

          // Remover email do objeto user
          if (respObj && respObj.user && typeof respObj.user.email === 'string') {
            respObj.user.email = respObj.user.email.replace('@user.com', '');
          }
          // Algumas respostas podem devolver diretamente o objeto user
          if (respObj && typeof respObj.email === 'string' && !respObj.user) {
            respObj.email = respObj.email.replace('@user.com', '');
          }

          responseBody = JSON.stringify(respObj);
          responseHeaders.set('content-length', String(new Blob([responseBody]).size));
        } catch (_) {
          // Fallback silencioso
          responseBody = upstreamResponse.body;
        }
      }

      return new Response(responseBody, {
        status: upstreamResponse.status,
        headers: responseHeaders,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
