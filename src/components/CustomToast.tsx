import React, { useEffect } from 'react';
import { useApp, ToastConfig } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastItemProps {
  toast: ToastConfig;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const { id, message, type, duration = 2500 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#00e676] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClose(id)}
      className="pointer-events-auto cursor-pointer max-w-[90vw] md:max-w-md rounded-2xl bg-slate-900/95 text-white px-4 py-3 flex items-center gap-2.5 shadow-2xl backdrop-blur-md border border-white/10 select-none active:scale-95 transition-transform"
    >
      {getIcon()}
      <span className="text-xs font-semibold leading-snug text-white font-sans">
        {message}
      </span>
    </motion.div>
  );
};

export const CustomToast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div 
      className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 pointer-events-none items-center justify-center px-4"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
