import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppProvider } from './context/AppContext';
import { CustomAlert } from './components/CustomAlert';
import { CustomToast } from './components/CustomToast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
      <CustomAlert />
      <CustomToast />
    </AppProvider>
  </StrictMode>,
);
