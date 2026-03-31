import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';

export const TopBanner: React.FC = () => {
  const { referrer, setReferrerByCode } = useData();

  useEffect(() => {
    // Simulate getting referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferrerByCode(ref);
    }
  }, [setReferrerByCode]);

  if (!referrer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        exit={{ y: -50 }}
        className="fixed top-0 left-0 w-full bg-[#D4AF37] text-black text-center py-1.5 z-[70] font-bold text-[10px] sm:text-sm shadow-md"
      >
        Você está navegando pelo link de <span className="underline">{referrer.name}</span>
      </motion.div>
    </AnimatePresence>
  );
};
