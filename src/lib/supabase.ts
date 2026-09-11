import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não informados no .env local.');
}

export const DB_TIMEOUT_MS = 30000; // 30 segundos global

export const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs: number = DB_TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  if (init?.signal) {
    init.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal
    });
    return response;
  } catch (error: any) {
    if (error?.name === 'AbortError' || controller.signal.aborted) {
      throw new Error('O tempo limite da solicitação expirou (30s). Verifique a sua conexão com a internet e tente novamente.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'api' },
  global: {
    fetch: (input, init) => fetchWithTimeout(input, init, DB_TIMEOUT_MS)
  },
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
      method: 'GET',
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

  const resp = await fetchWithTimeout(GATEWAY_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ payload: encryptedBody })
  }, DB_TIMEOUT_MS);

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
