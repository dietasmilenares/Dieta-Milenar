import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { DuvidasFrequentesItem } from '../types';
import { SectionDivider } from './SectionDivider';

export const DuvidasFrequentes: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const items: DuvidasFrequentesItem[] = [
    { 
      id: '1', 
      question: "Preciso de muito tempo para seguir o método?", 
      answer: "Absolutamente não. O Protocolo Egípcio foi desenhado para a vida moderna. Você não precisa passar horas na cozinha ou se matar na academia. O foco é na eficiência biológica e em ajustes estratégicos que levam poucos minutos do seu dia." 
    },
    { 
      id: '2', 
      question: "Já tentei de tudo e nada funcionou. Por que este seria diferente?", 
      answer: "A maioria das dietas modernas foca apenas em 'comer menos', o que destrói seu metabolismo. Nosso método foca na reprogramação hormonal através de alimentos milenares. Estamos atacando a causa raiz do acúmulo de gordura, e não apenas remediando o sintoma." 
    },
    { 
      id: '3', 
      question: "Tenho metabolismo lento ou mais de 50 anos, funciona?", 
      answer: "Sim! Na verdade, o método é ideal para quem sente que o metabolismo 'travou'. Ele utiliza combinações de nutrientes que os antigos faraós usavam para manter a vitalidade e força, reativando as engrenagens naturais de queima de gordura do seu corpo, independente da sua idade." 
    },
    { 
      id: '4', 
      question: "Vou precisar comprar suplementos caros ou remédios?", 
      answer: "Zero suplementos. Zero remédios. O Antigo Egito não tinha farmácias, e eles exibiam os corpos mais esculpidos da história. Você usará apenas alimentos reais e acessíveis que você já encontra no supermercado, mas combinados da forma que a indústria nunca te contou." 
    },
    { 
      id: '5', 
      question: "Vou passar fome ou a dieta é muito restritiva?", 
      answer: "Esqueça a tortura das dietas convencionais. O segredo egípcio foca na saciedade profunda. Você vai comer alimentos densos que 'desligam' o sinal de fome no seu cérebro, permitindo que você emagreça com prazer e energia de sobra." 
    },
    { 
      id: '6', 
      question: "Em quanto tempo verei os primeiros resultados?", 
      answer: "A maioria dos nossos alunos relata uma redução visível no inchaço abdominal e um aumento explosivo na disposição já nos primeiros 7 dias. A transformação na balança e no espelho acontece de forma progressiva e sustentável logo nas primeiras semanas." 
    },
    { 
      id: '7', 
      question: "E se eu não me adaptar ao método?", 
      answer: "Sua satisfação é protegida por nossa Garantia Imperial. Você tem 30 dias para testar tudo. Se por qualquer motivo você achar que não é para você, basta um único e-mail e devolvemos 100% do seu investimento. O risco é todo nosso." 
    },
    { 
      id: '8', 
      question: "Como recebo o acesso ao material?", 
      answer: "O acesso é imediato! Assim que seu pagamento for confirmado, você receberá um e-mail com seus dados de acesso à nossa plataforma exclusiva, onde todos os guias, cardápios e bônus já estarão te esperando." 
    },
  ];

  return (
    <section id="faq" className="pt-16 pb-8 md:pt-24 md:pb-12 bg-gray-900 text-white">
      <SectionDivider className="mb-12 opacity-50" />
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center font-heading mb-10 md:mb-12 text-golden-gradient">
          Dúvidas Frequentes
        </h2>
        
        <div className="space-y-3 md:space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border-2 border-[#FFD700] rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === item.id ? null : item.id)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left bg-black hover:bg-gray-900 transition-colors"
              >
                <span className="text-sm md:text-base font-semibold text-gray-200 pr-4">{item.question}</span>
                {openIndex === item.id ? <Minus className="text-[#D4AF37] shrink-0 w-4 h-4 md:w-5 md:h-5" /> : <Plus className="text-[#D4AF37] shrink-0 w-4 h-4 md:w-5 md:h-5" />}
              </button>
              
              <AnimatePresence>
                {openIndex === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 md:p-5 pt-0 text-xs md:text-sm text-white bg-black border-t border-gray-800">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};