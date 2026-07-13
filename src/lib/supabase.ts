import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/data`
  : 'http://localhost:3000/api/data';

const SUPABASE_ANON_KEY = 'proxy-secured';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'api' },
  realtime: {
    // Vercel serverless does not support WebSocket upgrades.
    // The app uses 60s polling as a fallback — Realtime is disabled here.
    params: { eventsPerSecond: -1 },
  },
  global: {
    headers: {
      // Prevents supabase-js from trying to upgrade to WebSocket on Vercel.
    },
  },
});


export const GATEWAY_URL = `${SUPABASE_URL}/functions/v1/gateway`;

export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

const INTERNET_CHECK_URL = `${SUPABASE_URL}/auth/v1`;

let lastConnectivityResult: boolean | null = null;
let lastConnectivityCheckTime = 0;

export const checkInternetConnectivity = async (timeoutMs = 4000): Promise<boolean> => {
  if (typeof window === 'undefined') return true;
  if (!navigator.onLine) return false;

  const now = Date.now();
  if (lastConnectivityResult !== null && now - lastConnectivityCheckTime < 10000) {
    return lastConnectivityResult;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {

    await fetch(INTERNET_CHECK_URL, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal
    });
    lastConnectivityResult = true;
    lastConnectivityCheckTime = now;
    return true;
  } catch {
    const isOnline = navigator.onLine;
    lastConnectivityResult = isOnline;
    lastConnectivityCheckTime = now;
    return isOnline;
  } finally {
    window.clearTimeout(timeout);
  }
};

export const gatewayCall = async (op: number, payload: any = {}) => {
  const connected = await checkInternetConnectivity();
  if (!connected) {
    throw new Error('Sem conexão de internet. Verifique seus dados móveis ou WiFi.');
  }
  const token = await getAccessToken();
  if (!token) throw new Error('Sessão inválida');

  const resp = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ op, data: payload })
  });

  const data = await resp.json();
  
  if (resp.status === 401 && data.force_logout) {
    await supabase.auth.signOut();
    window.dispatchEvent(new Event('force-logout'));
    throw new Error('SESSION_EXPIRED');
  }

  if (!resp.ok) {
    throw new Error(data.error || data.message || 'Erro na requisição');
  }

  return data;
};
