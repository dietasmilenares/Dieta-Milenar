import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';
import { useData } from '../context/DataContext';

interface PricingProps {
  onSelectPlan: (planName: string, price: string, paymentLink?: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const { plans } = useData();
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const togglePlan = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <section id="pricing" className="pt-0 pb-16 md:pb-24 bg-black text-white relative overflow-hidden">
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading mb-4">
            Escolha seu <span className="text-golden-gradient">Protocolo</span>
          </h2>
          <p className="text-white text-base md:text-lg max-w-2xl mx-auto">
            O conhecimento que ficou escondido por séculos agora está ao seu alcance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {plans.filter(p => p.active !== false).map((plan) => (
            <div 
              key={plan.id}
              className={`
                ${plan.isPopular 
                  ? 'bg-gradient-to-b from-[#D4AF37] to-[#B4941F] border-2 border-[#FFD700] shadow-2xl shadow-[#D4AF37]/20 order-1 md:order-2 z-20' 
                  : 'bg-gray-900/50 backdrop-blur-sm border-2 border-[#FFD700] opacity-90 md:opacity-80 hover:opacity-100 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] order-2 md:order-1'
                }
                rounded-2xl p-6 md:p-8 transition-all relative
              `}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg whitespace-nowrap border border-[#D4AF37] z-30">
                  MAIS VENDIDO
                </div>
              )}

              <h3 className={`text-xl md:text-2xl font-bold font-heading ${plan.isPopular ? 'text-black' : 'text-white'}`}>
                {plan.name}
              </h3>
              
              {plan.isPopular && (
                <p className="text-black/80 text-xs md:text-sm mt-1 font-medium">O segredo completo, para as próximas gerações</p>
              )}

              <div className="my-4 md:my-6">
                <span className={`text-xs md:text-sm line-through text-red-600 font-bold`}>
                  {formatPrice(plan.oldPrice)}
                </span>
                <div className={`text-3xl md:text-4xl font-bold font-display ${plan.isPopular ? 'text-black' : 'text-white'}`}>
                  {formatPrice(plan.price)}
                  <span className={`text-xs md:text-sm font-normal ${plan.isPopular ? 'text-black/70' : 'text-white'}`}>
                    /<span className={!plan.isPopular && plan.period === 'único' ? 'text-green-500' : ''}>{plan.period}</span>
                  </span>
                </div>
                {plan.isPopular && (
                  <span className="text-xs md:text-sm bg-black/10 px-2 py-1 rounded mt-2 inline-block text-black font-bold">
                    ou 12x de {formatPrice(plan.price / 10)}
                  </span>
                )}
              </div>

              <button 
                onClick={() => togglePlan(plan.id)}
                className={`flex items-center gap-2 text-sm font-bold mb-6 transition-colors ${
                  plan.isPopular 
                    ? 'text-black hover:text-black/70' 
                    : 'text-[#D4AF37] hover:text-[#FFD700]'
                }`}
              >
                {expandedPlan === plan.id ? (
                  <>Ver menos <ChevronUp size={16} /></>
                ) : (
                  <><span className={!plan.isPopular ? "text-golden-gradient" : ""}>Ver benefícios</span> <ChevronDown size={16} /></>
                )}
              </button>

              <AnimatePresence>
                {expandedPlan === plan.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                      {plan.features.map((f, i) => (
                        <li key={i} className={`flex items-start gap-3 text-xs md:text-sm ${plan.isPopular ? 'font-medium text-black' : 'text-white'}`}>
                          <div className={`${plan.isPopular ? 'bg-black/10' : ''} p-1 rounded-full shrink-0`}>
                            <Check size={12} className={plan.isPopular ? 'text-black' : 'text-green-400'} />
                          </div> 
                          {f}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                variant={plan.isPopular ? "accent" : "primary"} 
                fullWidth 
                onClick={() => onSelectPlan(plan.name, formatPrice(plan.price), plan.paymentLink)} 
                size="md"
                className={plan.isPopular ? "shadow-xl text-sm md:text-base shine-effect" : ""}
              >
                {plan.isPopular ? "QUERO DESCOBRIR O SEGREDO" : `Assinar ${plan.name}`}
              </Button>
              
              {plan.isPopular && (
                <p className="text-center text-[10px] md:text-xs text-black/70 mt-4 font-medium">
                  <span className="text-black font-bold border-b border-red-600">Economia de {formatPrice(plan.oldPrice - plan.price)} hoje</span>
                </p>
              )}
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};