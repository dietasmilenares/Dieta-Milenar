import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Lock, CheckCircle2 } from 'lucide-react';

interface PagamentoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Pagamento: React.FC<PagamentoProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border-2 border-[#D4AF37]/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] max-h-[90vh] overflow-y-auto"
          >
            {/* Thematic Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyros.png')] opacity-10 pointer-events-none"></div>
            
            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37]/60 rounded-tl-2xl pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#D4AF37]/60 rounded-tr-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#D4AF37]/60 rounded-bl-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37]/60 rounded-br-2xl pointer-events-none"></div>

            <div className="p-8 md:p-12 relative z-10">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-[#D4AF37]/10 rounded-full transition-colors text-[#D4AF37]/60 hover:text-[#D4AF37]"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                  <CreditCard className="w-16 h-16 text-[#D4AF37] opacity-80" />
                </div>
                <span className="text-golden-gradient font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs">Segurança Total</span>
                <h2 className="text-4xl md:text-6xl font-bold font-display text-white mt-3 leading-tight">
                  Finalizar <br/>
                  <span className="text-golden-gradient italic font-heading font-light">Pagamento</span>
                </h2>
              </div>

              <div className="space-y-10 text-gray-300 leading-relaxed font-sans">
                <section className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent"></div>
                  <p className="text-xl md:text-2xl font-heading italic text-sand/90 mb-6 pl-4">
                    "Sua jornada para uma vida mais saudável começa aqui, com total segurança e transparência."
                  </p>
                  <p className="text-base md:text-lg text-gray-400">
                    Escolha a melhor forma de pagamento e garanta seu acesso imediato ao <strong className="text-white font-semibold">Protocolo do Antigo Egito</strong>.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-[#D4AF37]/10">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-black border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-[#D4AF37] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                      <Lock size={28} className="text-[#D4AF37]" />
                    </div>
                    <h4 className="text-white font-heading font-bold text-lg mb-2">Ambiente Seguro</h4>
                    <p className="text-xs text-gray-500 leading-tight">Seus dados estão protegidos por criptografia de ponta a ponta.</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-black border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-[#D4AF37] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                      <CheckCircle2 size={28} className="text-[#D4AF37]" />
                    </div>
                    <h4 className="text-white font-heading font-bold text-lg mb-2">Acesso Imediato</h4>
                    <p className="text-xs text-gray-500 leading-tight">Receba seu acesso logo após a confirmação do pagamento.</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-black border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-[#D4AF37] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                      <CreditCard size={28} className="text-[#D4AF37]" />
                    </div>
                    <h4 className="text-white font-heading font-bold text-lg mb-2">Múltiplas Formas</h4>
                    <p className="text-xs text-gray-500 leading-tight">Aceitamos cartões, PIX e outras formas de pagamento.</p>
                  </div>
                </div>

                <section className="bg-gradient-to-r from-[#D4AF37]/5 to-transparent p-8 rounded-2xl border border-[#D4AF37]/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <CreditCard size={120} className="text-[#D4AF37]" />
                  </div>
                  <p className="text-sm md:text-base text-sand/80 relative z-10 leading-relaxed">
                    Dúvidas sobre o pagamento? Nossa equipe de suporte está pronta para ajudar você a qualquer momento.
                  </p>
                </section>
              </div>

              <div className="mt-12 pt-8 border-t border-[#D4AF37]/10 text-center">
                <button 
                  onClick={onClose}
                  className="golden-gradient-glow text-black font-bold py-4 px-12 rounded-full text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.3)] transition-all"
                >
                  Continuar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
