import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWidgetProps {
  footerOffset?: number;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ footerOffset = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Clear unread count when opening
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for the specific message from the iframe
      if (event.data === 'NEW_CHAT_MESSAGE') {
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className={`fixed right-4 z-50 p-4 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-gray-900 text-gray-400 rotate-90' 
            : 'bg-[#D4AF37] text-black hover:bg-[#b5952f] hover:shadow-[0_8px_32px_rgba(212,175,55,0.3)]'
        }`}
        style={{ bottom: footerOffset - 2 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} fill="currentColor" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Chat Window (Iframe Modal) */}
      <motion.div
        key="chat-modal"
        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
        animate={{ 
          opacity: isOpen ? 1 : 0, 
          y: isOpen ? 0 : 20, 
          scale: isOpen ? 1 : 0.9,
          pointerEvents: isOpen ? 'auto' : 'none',
          width: isExpanded 
            ? 'min(95vw, 1200px)' 
            : 'min(calc(100vw - 2rem), 400px)',
          height: isExpanded 
            ? 'min(92vh, 800px)' 
            : 'min(75vh, 550px)',
          bottom: isExpanded ? '1rem' : `calc(${footerOffset}px + 5.5rem)`,
          right: isExpanded ? '50%' : '1rem',
          translateX: isExpanded ? '50%' : '0%',
        }}
        className="fixed z-50 bg-black rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-[#D4AF37]/30 flex flex-col transition-[bottom,height,width] duration-300"
        style={{ 
          maxHeight: 'calc(100dvh - 2rem)',
          transformOrigin: isExpanded ? 'center' : 'bottom right'
        }}
      >
        {/* Content Area */}
        <div className="flex-1 bg-black relative overflow-hidden">
          <div className="w-full h-full">
            <iframe 
              src="https://socialproof-production.up.railway.app/widget/index.php?room=dieta-faraonica" 
              className="w-full h-full border-0"
              title="Comunidade Faraônica Chat"
              allowFullScreen
              referrerPolicy="no-referrer"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};

