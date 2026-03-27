import React from 'react';
import { motion } from 'motion/react';
import { Target, Heart, Zap, Pyramid, Utensils, Flame } from 'lucide-react';
import { Pillar } from '../types';
import { SectionDivider } from './SectionDivider';

export const SolutionSection: React.FC = () => {
  const pillars: Pillar[] = [
    {
      icon: <Pyramid className="w-12 h-12 text-[#D4AF37]" />,
      title: "Sabedoria Ancestral",
      description: "Baseado nos registros históricos de uma civilização que construiu o impossível com corpos fortes e funcionais."
    },
    {
      icon: <Utensils className="w-12 h-12 text-[#D4AF37]" />,
      title: "Alimentação Estratégica",
      description: "Não é sobre cortar tudo, mas sobre a combinação e a ordem correta dos alimentos que você já tem em casa."
    },
    {
      icon: <Flame className="w-12 h-12 text-[#D4AF37]" />,
      title: "Metabolismo Ativo",
      description: "Reative a queima natural de gordura do seu corpo sem depender de estimulantes ou exercícios exaustivos."
    }
  ];

  return (
    <section id="solution" className="py-16 md:py-24 bg-black text-white relative">
      <SectionDivider className="mb-12 opacity-50" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyros.png')] opacity-5 pointer-events-none"></div>
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-golden-gradient font-bold tracking-[0.3em] uppercase text-xs md:text-sm">A Redescoberta Ancestral</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white mt-2 mb-4 md:mb-6">
            O Método da <span className="italic text-golden-gradient">Dieta Milenar</span>
          </h2>
          <p className="text-lg md:text-xl text-white max-w-3xl mx-auto font-light">
            Um protocolo simples, esquecido por séculos, que atua na raiz do problema metabólico. Sem fome, sem remédios, apenas a natureza agindo a seu favor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 25px -5px rgba(212, 175, 55, 0.1), 0 10px 10px -5px rgba(212, 175, 55, 0.04)",
                borderColor: "rgba(212, 175, 55, 0.5)"
              }}
              className="bg-black rounded-2xl p-6 md:p-8 text-center transition-all duration-300 border-2 border-[#FFD700] shadow-lg"
            >
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="bg-gray-900 w-16 h-16 md:w-20 md:h-20 rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 md:mb-6 border border-[#D4AF37]/20"
              >
                {React.cloneElement(pillar.icon as React.ReactElement, { className: "w-8 h-8 md:w-12 md:h-12" })}
              </motion.div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-golden-gradient">{pillar.title}</h3>
              <p className="text-sm md:text-base text-white leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};