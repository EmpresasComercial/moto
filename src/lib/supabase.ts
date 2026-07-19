import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam de estar configuradas.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'api' },
  realtime: {
    params: { eventsPerSecond: -1 },
  },
});


export const GATEWAY_URL = `${SUPABASE_URL}/functions/v1/gateway`;

export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};
const INTERNET_CHECK_URL = `${SUPABASE_URL}/auth/v1/health`;

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
      headers: {
        'apikey': SUPABASE_ANON_KEY
      },
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

import { encryptPayload, decryptPayload } from './crypto';

export const gatewayCall = async (op: number, payload: any = {}, requireAuth: boolean = true) => {
  const connected = await checkInternetConnectivity();
  if (!connected) {
    throw new Error('Sem conexão de internet. Verifique seus dados móveis ou WiFi.');
  }
  const token = await getAccessToken();
  if (requireAuth && !token) throw new Error('Sessão inválida');

  const encryptedBody = await encryptPayload({ op, data: payload });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ payload: encryptedBody })
  });

  const respJson = await resp.json();
  
  if (resp.status === 401 && respJson.force_logout) {
    await supabase.auth.signOut();
    window.dispatchEvent(new Event('force-logout'));
    throw new Error('SESSION_EXPIRED');
  }

  if (!resp.ok) {
    throw new Error(respJson.error || respJson.message || 'Erro na requisição');
  }

  if (respJson.payload) {
    const decrypted = await decryptPayload(respJson.payload);
    return decrypted;
  }

  return respJson;
};
