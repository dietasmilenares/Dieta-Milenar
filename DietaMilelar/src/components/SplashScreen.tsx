import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://static.todamateria.com.br/upload/eg/it/egito-og.jpg" 
          alt="Ancient Egypt Background" 
          className="w-full h-full object-cover opacity-40 scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="relative max-w-[300px] sm:max-w-[500px] md:max-w-[600px]">
            <motion.img 
              src="https://i.ibb.co/ymvJS10g/1772139283033-removebg-preview.png"
              alt="Dieta Milenar Splash"
              className="w-full h-auto drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              initial={{ filter: "brightness(0) blur(10px)", scale: 0.8 }}
              animate={{ filter: "brightness(1) blur(0px)", scale: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
              referrerPolicy="no-referrer"
            />
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 18, delay: 1, ease: "linear" }}
              className="h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-8 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
            />
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-6 space-y-6 flex flex-col items-center"
          >
            <div className="space-y-2">
              <p className="text-golden-gradient text-sm sm:text-lg font-medium tracking-[0.5em] uppercase">
                Iniciando Protocolo Ancestral
              </p>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                  />
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-8 py-2 border border-[#D4AF37]/30 rounded-full text-[#D4AF37] text-xs uppercase tracking-[0.2em] hover:bg-[#D4AF37]/10 transition-all duration-300 backdrop-blur-sm"
            >
              Pular Introdução
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Atmosphere Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
      </div>
    </motion.div>
  );
};
