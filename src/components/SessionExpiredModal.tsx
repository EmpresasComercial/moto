import React, { useEffect, useRef } from 'react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  message?: string;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, message }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReLogin = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        try {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map(key => caches.delete(key)));
        } catch {}
      }
      try {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      } catch {}
    } catch {} finally {
      window.location.href = '/register';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop: translucent dark overlay with a soft blur for focus */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Modern, light, clean white modal styled exactly like the screenshot */}
      <div 
        className="relative w-full max-w-[340px] transform overflow-hidden rounded-[16px] bg-white shadow-2xl border border-neutral-100 transition-all duration-200 flex flex-col font-sans select-none animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header matching screenshot structure */}
        <div className="relative flex items-center justify-center py-3.5 px-4 border-b border-neutral-100 select-none">
          {/* Mock/functional Close X button on the left */}
          <button 
            onClick={handleReLogin}
            className="absolute left-4 text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer p-0.5"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Centered Title */}
          <span 
            id="modal-title" 
            className="text-[16px] font-bold text-neutral-800 tracking-tight text-center"
          >
            Sessão Expirada
          </span>
        </div>

        {/* Body content with dynamic text spacing and style */}
        <div className="px-5 py-5 select-text">
          <p className="text-[13px] text-neutral-600 leading-relaxed text-left">
            {message || 'A sua sessão expirou por segurança. Por favor, faça login novamente para continuar.'}
          </p>
        </div>

        {/* Buttons footer matching design in screenshot */}
        <div className="px-5 pb-5 pt-1 flex justify-center w-full">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleReLogin}
            className="w-full h-10 bg-[#1e88e5] hover:bg-[#1565c0] active:scale-[0.98] text-white text-[13px] font-semibold rounded-[8px] transition-all flex items-center justify-center cursor-pointer shadow-sm shadow-[#1e88e5]/10 focus:outline-none focus:ring-2 focus:ring-[#1e88e5] focus:ring-offset-2"
          >
            Logar Novamente
          </button>
        </div>
      </div>
    </div>
  );
};
