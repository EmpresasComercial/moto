import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Motorcycle } from '../types';

interface ContinuousTopCarouselProps {
  motorcycles: Motorcycle[];
  onSelectMotorcycleForBooking?: (moto: Motorcycle) => void;
  onViewDetails?: (moto: Motorcycle) => void;
}

export const ContinuousTopCarousel: React.FC<ContinuousTopCarouselProps> = ({
  motorcycles,
  onViewDetails,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<number>(1); // 1 = forward, -1 = backward

  // Extrai apenas as motos com imagem válida
  const bikes = motorcycles.length > 0 ? motorcycles : [];
  const total = bikes.length;

  // Auto-play: dura alguns segundos (3.8s) e passa suavemente para a próxima imagem
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3800);

    return () => clearInterval(timer);
  }, [total, isPaused]);

  if (total === 0) return null;

  const currentMoto = bikes[currentIndex];

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Garante que a URL da imagem não force crop caso venha com parâmetros restritivos
  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    // Substitui fit=crop por fit=max para carregar a imagem original na proporção correta
    return url.replace('fit=crop', 'fit=max');
  };

  // Variantes de transição deslizante suave
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 28 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 28 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  return (
    <div
      className="w-full bg-slate-950 relative rounded-b-2xl sm:rounded-b-3xl rounded-t-none border-x border-b border-slate-800 shadow-xl overflow-hidden group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* 
        Palco Principal da Imagem:
        - Altura fixa/responsiva adaptável
        - object-contain para a imagem JAMAIS ser recortada
        - Sem textos, descrições ou preços
      */}
      <div 
        className="relative w-full h-56 xs:h-64 sm:h-80 md:h-96 lg:h-[440px] flex items-center justify-center p-3 sm:p-6 overflow-hidden cursor-pointer"
        onClick={() => onViewDetails && onViewDetails(currentMoto)}
      >
        {/* Iluminação de fundo sutil para destacar a motocicleta sem competir */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 bg-slate-900/60 rounded-full blur-3xl opacity-50" />
        </div>

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentMoto.id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center p-2 sm:p-5"
          >
            <img
              src={getFullImageUrl(currentMoto.image)}
              alt=""
              className="w-full h-full object-contain max-h-full max-w-full drop-shadow-2xl select-none pointer-events-none"
              referrerPolicy="no-referrer"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* Botão Anterior (aparece com sutileza no hover para controle manual) */}
        <button
          type="button"
          aria-label="Imagem anterior"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-700/60 shadow-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-20"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Botão Próximo (aparece com sutileza no hover para controle manual) */}
        <button
          type="button"
          aria-label="Próxima imagem"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-700/60 shadow-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-20"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Indicadores Minimalistas de Paginação (sem nenhum texto) */}
        <div 
          className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20 px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-xs border border-slate-800/80"
          onClick={(e) => e.stopPropagation()}
        >
          {bikes.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Ver imagem ${idx + 1}`}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 sm:w-8 bg-[#00c853]'
                  : 'w-1.5 sm:w-2 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
