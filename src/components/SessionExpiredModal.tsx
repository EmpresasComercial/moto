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
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-[270px] overflow-hidden flex flex-col shadow-xl border border-neutral-100/50 animate-scaleIn">
        <div className="px-5 py-6 text-center">
          <p className="text-[14px] font-bold text-neutral-800 leading-snug">
            A sua sessão expirou. Por favor, inicie novamente.
          </p>
        </div>
        
        <div className="border-t border-neutral-100 flex">
          <button 
            ref={buttonRef}
            type="button"
            onClick={handleReLogin}
            className="flex-1 py-3 text-[14px] font-bold text-[#2563eb] hover:bg-neutral-50 active:bg-neutral-100 focus:outline-none transition-colors cursor-pointer"
          >
            Logar
          </button>
        </div>
      </div>
    </div>
  );
};
