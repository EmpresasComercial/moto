import React from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CheckCircle, Info, HelpCircle, AlertTriangle } from 'lucide-react';

export const CustomAlert: React.FC = () => {
  const { alertConfig, closeAlert } = useApp();

  if (!alertConfig || !alertConfig.isOpen) return null;

  const { message, title, type, onConfirm } = alertConfig;

  const getHeaderStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600',
          icon: <CheckCircle className="h-6 w-6 stroke-[2.5]" />,
          defaultTitle: 'Sucesso'
        };
      case 'error':
        return {
          bg: 'bg-red-500/10 text-red-600',
          icon: <ShieldAlert className="h-6 w-6 stroke-[2.5]" />,
          defaultTitle: 'Aviso de Segurança'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 text-amber-600',
          icon: <AlertTriangle className="h-6 w-6 stroke-[2.5]" />,
          defaultTitle: 'Atenção'
        };
      case 'confirm':
        return {
          bg: 'bg-blue-500/10 text-blue-600',
          icon: <HelpCircle className="h-6 w-6 stroke-[2.5]" />,
          defaultTitle: 'Confirmação'
        };
      case 'info':
      default:
        return {
          bg: 'bg-[#00c853]/10 text-[#00a840]',
          icon: <Info className="h-6 w-6 stroke-[2.5]" />,
          defaultTitle: 'Asiary Moto'
        };
    }
  };

  const config = getHeaderStyle();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && type !== 'confirm') {
      closeAlert();
    }
  };

  return (
    <AnimatePresence>
      <div 
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="bg-white w-full max-w-[360px] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-center"
        >
          <div className="pt-6 pb-2 flex flex-col items-center gap-2">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${config.bg}`}>
              {config.icon}
            </div>
            <h3 className="px-4 text-base font-bold text-slate-900 font-sans">
              {title || config.defaultTitle}
            </h3>
          </div>

          <div className="px-6 py-3 max-h-[240px] overflow-y-auto">
            <p className="whitespace-pre-line text-xs text-slate-600 font-sans leading-relaxed">
              {message}
            </p>
          </div>

          <div className="mt-2 border-t border-slate-100 bg-slate-50 p-4 flex gap-2 justify-center">
            {type === 'confirm' ? (
              <>
                <button
                  onClick={closeAlert}
                  className="flex-1 h-10 bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    closeAlert();
                    if (onConfirm) onConfirm();
                  }}
                  className="flex-1 h-10 bg-[#00c853] hover:bg-[#00b341] text-white transition-all font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-[#00c853]/20"
                >
                  Confirmar
                </button>
              </>
            ) : (
              <button
                onClick={closeAlert}
                className="w-full h-10 bg-[#00c853] hover:bg-[#00b341] text-white transition-all font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-[#00c853]/20"
              >
                Entendido
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
