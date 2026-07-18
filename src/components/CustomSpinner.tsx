import React from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export const CustomSpinner: React.FC = () => {
  const { isLoading, loadingMessage } = useApp();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
          className="fixed inset-0 z-[10001] flex flex-col items-center justify-center p-5 bg-white select-none pointer-events-auto"
          id="global-spinner-overlay"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="h-10 w-10 rounded-full border-[3px] border-blue-100 border-t-[3px] border-t-blue-600"
              style={{
                animation: 'spin 0.5s linear infinite',
              }}
            />
            <span className="text-sm font-medium text-blue-600">Carregando...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
