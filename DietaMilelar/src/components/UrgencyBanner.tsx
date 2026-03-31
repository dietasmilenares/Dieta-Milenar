import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCountdown } from '../hooks/useCountdown';

interface UrgencyBannerProps {
  onCTAClick: () => void;
  footerOffset?: number;
}

export const UrgencyBanner: React.FC<UrgencyBannerProps> = ({ onCTAClick, footerOffset = 0 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { hours, minutes, seconds } = useCountdown(15); // 15 minutes countdown

  const handleClick = () => {
    setIsVisible(false);
    onCTAClick();
    
    // Reappear after 1 minute (60000ms)
    setTimeout(() => {
      setIsVisible(true);
    }, 60000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed left-4 w-[calc(80%-2rem)] z-40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden p-[2px]"
          style={{ bottom: footerOffset - 2 }}
        >
          <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] conic-glow" />
          <div className="relative w-full h-full bg-black/95 backdrop-blur-md rounded-[14px] text-white py-2 px-4 flex flex-row items-center justify-between gap-2">
            <div className="flex flex-col min-[450px]:flex-row items-center min-[450px]:items-center gap-1 min-[450px]:gap-2 overflow-hidden min-w-0 flex-1 min-[450px]:flex-none">
              <span className="golden-gradient-glow text-black px-1 py-0.5 rounded-[3px] text-[7px] sm:text-[9px] font-black uppercase whitespace-nowrap shrink-0">
                OFERTA
              </span>
              <p className="text-[8px] sm:text-[10px] font-medium text-gray-300 leading-tight text-center min-[450px]:text-left">
                O acesso ao protocolo será fechado em:
              </p>
            </div>
            
            <button 
              onClick={handleClick}
              className="golden-gradient-glow text-black px-2 sm:px-4 py-1 sm:py-1.5 rounded-full font-bold text-[9px] sm:text-[11px] transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 shine-effect shrink-0"
            >
              <span className="hidden min-[450px]:inline">Garantir Agora</span>
              <span className="min-[450px]:hidden uppercase">Garantir</span>
              <div className="flex gap-0.5 font-mono text-[9px] sm:text-xs font-black bg-black/10 px-1 py-0.5 rounded border border-black/10">
                <span>{minutes.toString().padStart(2, '0')}</span>:<span>{seconds.toString().padStart(2, '0')}</span>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};