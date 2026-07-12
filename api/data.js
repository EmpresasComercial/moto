/**
 * api/data.js — Vercel Serverless Proxy
 *
 * Intercepts all /api/data/* requests from the browser.
 * Injects the real Supabase credentials server-side.
 * The client only ever sees /api/data — never the real URL or provider.
 *
 * NOTE: This file uses ESM (export) syntax because package.json has "type": "module".
 */

const STRIP_RESPONSE_HEADERS = [
  'sb-project-ref',
  'sb-gateway-version',
  'sb-auth-user-id',
  'sb-auth-session-id',
  'sb-auth-refresh-token-prefix',
  'sb-request-id',
  'sb-edge-region',
  'x-sb-edge-region',
  'x-served-by',
  'x-supabase-api-version',
  'x-deno-execution-id',
  'x-envoy-attempt-count',
  'x-envoy-upstream-service-time',
  'endpoint-load-metrics',
];

const SKIP_REQUEST_HEADERS = [
  'host',
  'connection',
  'transfer-encoding',
  'x-client-info',
  'x-supabase-api-version',
];

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(502).json({ error: 'Service configuration error.' });
    return;
  }

  // Vercel rewrites /api/data/(.*) → /api/data?_path=$1
  // req.url here is e.g. "/api/data?_path=auth%2Fv1%2Ftoken&grant_type=password"
  const rawQuery = (req.url || '').split('?')[1] || '';
  const searchParams = new URLSearchParams(rawQuery);
  const pathParam = searchParams.get('_path') || '';

  // Remove _path, forward the rest as query to Supabase
  searchParams.delete('_path');
  const remainingQuery = searchParams.toString();

  const supabasePath = remainingQuery ? `${pathParam}?${remainingQuery}` : pathParam;
  const targetUrl = `${SUPABASE_URL}/${supabasePath}`;

  console.log('[proxy] →', req.method, targetUrl);

  // Build forwarded headers
  const forwardHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!SKIP_REQUEST_HEADERS.includes(key.toLowerCase())) {
      forwardHeaders[key] = value;
    }
  }

  forwardHeaders['apikey'] = SUPABASE_ANON_KEY;

  if (forwardHeaders['authorization'] === 'Bearer proxy-secured') {
    forwardHeaders['authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  // Read request body (for POST/PATCH/PUT)
  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    if (chunks.length > 0) {
      body = Buffer.concat(chunks);
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body && body.length > 0 ? body : undefined,
    });

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (!STRIP_RESPONSE_HEADERS.includes(key.toLowerCase())) {
        if (
          key.toLowerCase() === 'access-control-expose-headers' ||
          key.toLowerCase() === 'access-control-allow-headers'
        ) {
          const cleaned = value
            .split(',')
            .map((h) => h.trim())
            .filter(
              (h) =>
                !['x-client-info', 'apikey'].includes(h.toLowerCase()) &&
                !h.toLowerCase().includes('supabase')
            )
            .join(', ');
          if (cleaned) res.setHeader(key, cleaned);
        } else {
          res.setHeader(key, value);
        }
      }
    });

    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error('[proxy] Error:', err.message);
    res.status(502).json({ error: 'Service temporarily unavailable.' });
  }
}
