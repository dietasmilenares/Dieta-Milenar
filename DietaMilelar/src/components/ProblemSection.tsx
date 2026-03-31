import React from 'react';
import { motion } from 'motion/react';
import { XCircle, Activity, BatteryLow, DollarSign, Clock, Frown, Pizza, Scale, Pill } from 'lucide-react';
import { Problem } from '../types';
import { SectionDivider } from './SectionDivider';

export const ProblemSection: React.FC = () => {
  const problems: Problem[] = [
    { icon: <Pizza size={32} />, text: "Produtos ultraprocessados que viciam seu paladar" },
    { icon: <Scale size={32} />, text: "Ciclos infinitos de emagrecer e engordar (Efeito Sanfona)" },
    { icon: <BatteryLow size={32} />, text: "Falta de energia e cansaço crônico após as refeições" },
    { icon: <Frown size={32} />, text: "Dietas restritivas que te deixam com fome e mau humor" },
    { icon: <XCircle size={32} />, text: "Metabolismo lento que parece não responder a nada" },
    { icon: <Pill size={32} />, text: "Dependência de remédios e suplementos caros" },
  ];

  return (
    <section id="problem" className="py-16 md:py-24 bg-black text-white">
      <SectionDivider className="mb-12 opacity-50" />
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-4">
            <span className="text-white">Sistema moderno</span><br />
            <span className="text-red-600">Falhou com você</span>
          </h2>
          <p className="text-sm md:text-base text-white max-w-2xl mx-auto">
            A indústria da saúde nunca foi estruturada para saude, ela não quer que você morra, mas ela também não quer te ver curado! Medicamento gera renda, gente curada não!
          </p>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-white mb-4">
            Veja abaixo, eu sei que isso <br className="md:hidden" /> <span className="text-golden-gradient">acontece com você!</span>
          </h2>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gray-900 p-5 md:p-6 rounded-xl shadow-md hover:shadow-[#D4AF37]/20 transition-shadow border-l-4 border-[#D4AF37] flex items-start gap-4"
            >
              <div className="text-[#D4AF37] bg-black p-2 md:p-3 rounded-full shrink-0 border border-[#D4AF37]/20">
                {React.cloneElement(problem.icon as React.ReactElement, { size: 24 })}
              </div>
              <p className="text-sm md:text-base font-medium text-gray-300 leading-snug pt-1">
                {problem.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};