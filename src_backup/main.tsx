import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  const url = typeof args[0] === 'string' ? args[0] : (args[0] as any)?.url || '';
  
  if (response.status === 401) {
    try {
      const clone = response.clone();
      const data = await clone.json();
      const msg = data.error || 'A sua sessão expirou por motivos de segurança.';
      window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: msg } }));
    } catch (_) {
      window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: 'A sua sessão expirou por motivos de segurança.' } }));
    }
  } else if (url && url.includes('/functions/v1/gateway') && !response.ok) {
    try {
      const clone = response.clone();
      const data = await clone.json();
      const errText = JSON.stringify(data).toLowerCase();
      if (
        data?.force_logout ||
        errText.includes('expirou') ||
        errText.includes('expirada') ||
        errText.includes('expired') ||
        errText.includes('sessão') ||
        errText.includes('session')
      ) {
        const msg = data.error || 'A sua sessão expirou.';
        window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: msg } }));
      }
    } catch (_) {}
  }
  return response;
};


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
