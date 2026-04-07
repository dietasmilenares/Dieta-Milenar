import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { Button } from './Button';

export const CookieBanner: React.FC = () => {
  const { hasConsented, acceptCookies } = useCookieConsent();

  return (
    <AnimatePresence>
      {!hasConsented && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-[#0a0a0a] backdrop-blur-xl text-white p-5 md:p-8 z-[9999] border-2 border-[#D4AF37] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,1),0_0_30px_rgba(212,175,55,0.2)]"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                <h4 className="text-[#D4AF37] font-bold text-xs uppercase tracking-[0.3em]">Privacidade Ancestral</h4>
              </div>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                Nós utilizamos cookies para honrar sua experiência e entender como você navega em nosso templo digital. Ao continuar, você aceita nossa política de privacidade.
              </p>
            </div>
            <Button 
              onClick={acceptCookies} 
              size="lg" 
              variant="primary" 
              className="w-full md:w-auto px-10 py-4 font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform"
            >
              Aceitar Desafio
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};