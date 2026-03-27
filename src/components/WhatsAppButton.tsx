import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  return (
    <motion.a
      href="https://wa.me/55XXXXXXXXXXX"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-24 md:bottom-20 right-4 z-40 bg-green-500 text-white p-3 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors"
    >
      <MessageCircle size={28} className="md:w-8 md:h-8" />
      <span className="absolute right-full mr-3 bg-white text-gray-800 text-xs px-2 py-1 rounded shadow opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
        Dúvidas? Chame aqui!
      </span>
    </motion.a>
  );
};
