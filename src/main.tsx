import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';





import { encryptPayload, decryptPayload } from './lib/crypto';

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = typeof resource === 'string' ? resource : (resource as any)?.url || '';

  // Intercetar pedidos para a Edge Function do Gateway
  if (url.includes('/functions/v1/gateway') && config && config.method === 'POST' && config.body) {
    try {
      let bodyObj;
      if (typeof config.body === 'string') {
        bodyObj = JSON.parse(config.body);
      }
      
      // Encriptar se for um pedido JSON direto não-cifrado
      if (bodyObj && bodyObj.op && !bodyObj.payload) {
        const encrypted = await encryptPayload(bodyObj);
        config.body = JSON.stringify({ payload: encrypted });
      }
    } catch (e) {
      console.error("Erro ao cifrar pedido para o gateway:", e);
    }
    
    const response = await originalFetch(resource, config);
    
    // Decifrar resposta de sucesso vinda do gateway
    if (response.ok) {
      try {
        const clone = response.clone();
        const json = await clone.json();
        if (json && json.payload) {
          const decrypted = await decryptPayload(json.payload);
          return new Response(JSON.stringify(decrypted), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
      } catch (e) {
        console.error("Erro ao decifrar resposta do gateway:", e);
      }
    } else if (response.status === 401) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        const msg = data.error || 'A sua sessão expirou por segurança. Por favor, faça login novamente.';
        if (data.force_logout || msg.includes('SESSION_EXPIRED')) {
          window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: msg } }));
        }
      } catch (_) {}
    }
    
    return response;
  }

  return originalFetch(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
