import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pyramid, Heart, ShieldCheck } from 'lucide-react';

interface AboutUsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ isOpen, onClose }) => {
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
                  <img 
                    src="https://static.vecteezy.com/system/resources/thumbnails/067/855/578/small/eye-of-horus-egyptian-symbol-in-golden-gradient-png.png" 
                    alt="Olho de Hórus" 
                    className="w-12 h-12 object-contain opacity-80"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-golden-gradient font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs">Sabedoria Ancestral</span>
                <h2 className="text-4xl md:text-6xl font-bold font-display text-white mt-3 leading-tight">
                  O Legado da <br/>
                  <span className="text-golden-gradient italic font-heading font-light">Dieta Milenar</span>
                </h2>
              </div>

              <div className="space-y-10 text-gray-300 leading-relaxed font-sans">
                <section className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent"></div>
                  <p className="text-xl md:text-2xl font-heading italic text-sand/90 mb-6 pl-4">
                    "Não estamos inventando a roda, estamos apenas limpando a poeira de séculos de sabedoria esquecida."
                  </p>
                  <p className="text-base md:text-lg text-gray-400">
                    A <strong className="text-white font-semibold">Dieta Milenar</strong> nasceu da inquietação com o sistema de saúde moderno. Percebemos que, apesar de toda a tecnologia, as pessoas estão mais doentes, inflamadas e cansadas do que nunca. 
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-[#D4AF37]/10">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-black border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-[#D4AF37] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                      <Pyramid size={28} className="text-[#D4AF37]" />
                    </div>
                    <h4 className="text-white font-heading font-bold text-lg mb-2">Resgate Histórico</h4>
                    <p className="text-xs text-gray-500 leading-tight">Pesquisamos registros ancestrais para entender a base da saúde humana.</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-black border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-[#D4AF37] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                      <Heart size={28} className="text-[#D4AF37]" />
                    </div>
                    <h4 className="text-white font-heading font-bold text-lg mb-2">Saúde Real</h4>
                    <p className="text-xs text-gray-500 leading-tight">Focamos na cura de dentro para fora, tratando a inflamação crônica.</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-black border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-[#D4AF37] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                      <ShieldCheck size={28} className="text-[#D4AF37]" />
                    </div>
                    <h4 className="text-white font-heading font-bold text-lg mb-2">Independência</h4>
                    <p className="text-xs text-gray-500 leading-tight">Ensinamos você a não depender de suplementos ou remédios caros.</p>
                  </div>
                </div>

                <section>
                  <h3 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
                    Nossa Missão
                  </h3>
                  <p className="text-gray-400 text-base md:text-lg">
                    Nossa missão é democratizar o acesso ao conhecimento que manteve civilizações inteiras fortes e saudáveis por milênios. Acreditamos que a verdadeira nutrição não vem de laboratórios, mas da terra e da sabedoria que nossos ancestrais dominavam com maestria.
                  </p>
                </section>

                <section className="bg-gradient-to-r from-[#D4AF37]/5 to-transparent p-8 rounded-2xl border border-[#D4AF37]/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Pyramid size={120} className="text-[#D4AF37]" />
                  </div>
                  <p className="text-sm md:text-base text-sand/80 relative z-10 leading-relaxed">
                    Hoje, ajudamos mais de 15 mil pessoas a recuperarem sua vitalidade, autoestima e saúde através do Protocolo do Antigo Egito, adaptado para a vida moderna sem perder sua essência poderosa.
                  </p>
                </section>
              </div>

              <div className="mt-12 pt-8 border-t border-[#D4AF37]/10 text-center">
                <button 
                  onClick={onClose}
                  className="golden-gradient-glow text-black font-bold py-4 px-12 rounded-full text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.3)] transition-all"
                >
                  Voltar para o Início
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
