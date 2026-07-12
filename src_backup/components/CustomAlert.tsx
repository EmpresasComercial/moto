import React from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CheckCircle, Info, HelpCircle, AlertTriangle } from 'lucide-react';

export const CustomAlert: React.FC = () => {
  const { alertConfig, closeAlert } = useApp();

  if (!alertConfig || !alertConfig.isOpen) return null;

  const { message, title, type, onConfirm } = alertConfig;

  // Choose colors/icons based on type
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
          defaultTitle: 'Alerta de Segurança'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 text-amber-600',
          icon: <AlertTriangle className="h-6 w-6 stroke-[2.5]" />,
          defaultTitle: 'Aviso Importante'
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
          bg: 'bg-indigo-500/10 text-[#0d7377]',
          icon: <Info className="h-6 w-6 stroke-[2.5]" />,
          defaultTitle: 'Mensagem Asiaray'
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] select-none"
        id="custom-alert-backdrop"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-[340px] rounded-[16px] border border-neutral-200 shadow-lg flex flex-col overflow-hidden text-center"
          id="custom-alert-card"
        >
          {/* Header com ícone */}
          <div className="pt-6 pb-3 flex flex-col items-center gap-2">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${config.bg}`}>
              {config.icon}
            </div>
            <h3 className="px-4 text-base font-bold text-slate-900 font-sans">
              {title || config.defaultTitle}
            </h3>
          </div>

          {/* Mensagem */}
          <div className="px-6 py-3 max-h-[240px] overflow-y-auto no-scrollbar">
            <p className="whitespace-pre-line text-sm text-slate-700 font-sans leading-relaxed">
              {message}
            </p>
          </div>

          {/* Botões */}
          <div className="mt-2 border-t border-neutral-100 bg-neutral-50 p-4 flex gap-2 justify-center">
            {type === 'confirm' ? (
              <>
                <button
                  id="custom-alert-cancel-btn"
                  onClick={closeAlert}
                  className="flex-1 h-10 bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 transition-all font-semibold text-sm rounded-lg cursor-pointer"
                >
                  cancelar
                </button>
                <button
                  id="custom-alert-confirm-btn"
                  onClick={() => {
                    closeAlert();
                    if (onConfirm) onConfirm();
                  }}
                  className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all font-semibold text-sm rounded-lg cursor-pointer"
                >
                  confirmar
                </button>
              </>
            ) : (
              <button
                id="custom-alert-ok-btn"
                onClick={closeAlert}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all font-semibold text-sm rounded-lg cursor-pointer"
              >
                entendido
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
