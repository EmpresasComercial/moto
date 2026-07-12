import React, { useEffect } from 'react';
import { useApp, ToastConfig } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface ToastItemProps {
  toast: ToastConfig;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const { id, message, duration = 3000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="pointer-events-auto max-w-[280px] mx-auto rounded-[4px] bg-[#4a4a4a]/90 backdrop-blur-xs text-white px-5 py-2.5 flex items-center justify-center text-center shadow-md select-none border border-white/5"
      id={`toast-elem-${id}`}
    >
      <span className="text-[12px] font-medium leading-normal text-white font-sans tracking-wide">
        {message}
      </span>
    </motion.div>
  );
};

export const CustomToast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div 
      className="fixed top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-[340px] z-[10000] flex flex-col gap-2.5 pointer-events-none items-center justify-center"
      id="asiaray-global-toast-viewport"
    >
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={removeToast} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
