import React from 'react';
import { ShieldCheck } from 'lucide-react';

import { SectionDivider } from './SectionDivider';

export const Guarantee: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-900 to-black border-y border-[#D4AF37]/20">
      <SectionDivider className="mb-12 opacity-50" />
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <div className="inline-block p-3 md:p-4 bg-black rounded-full shadow-lg mb-4 md:mb-6 border border-[#D4AF37]">
          <ShieldCheck size={48} className="text-[#D4AF37] md:hidden" />
          <ShieldCheck size={64} className="text-[#D4AF37] hidden md:block" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 text-golden-gradient">
          Risco Zero: Garantia Incondicional de 30 Dias
        </h2>
        <p className="text-sm md:text-lg text-white mb-8 leading-relaxed">
          Aplique o método por 30 dias. Se você não sentir seu metabolismo acelerar, suas roupas ficarem mais largas e sua energia aumentar, nós devolvemos 100% do seu dinheiro. Sem perguntas. O risco é todo nosso.
        </p>
      </div>
    </section>
  );
};