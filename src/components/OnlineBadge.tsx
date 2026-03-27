import { useContent } from '../hooks/useContent';
import { motion } from 'motion/react';

export const OnlineBadge = () => {
  const { content } = useContent();
  
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
      <span>
        <span className="font-bold">{content.online.count}</span> {content.online.text}
      </span>
    </motion.div>
  );
};
