import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, Target, Activity, Flame, Dumbbell, Brain, Battery } from 'lucide-react';
import { Footer } from './Footer';

interface ProblemPageProps {
  onBack: () => void;
}

interface PainPoint {
  id: string;
  title: string;
  icon: React.ReactNode;
  shortDesc: string;
  pain: string;
  truth: string;
  solution: string;
}

const painPoints: PainPoint[] = [
  {
    id: 'pochete',
    title: 'A "Pochete" Teimosa',
    icon: <Target className="w-8 h-8 text-[#D4AF37]" />,
    shortDesc: 'Gordura abdominal que não sai por nada.',
    pain: 'Você faz abdominais, corta carboidratos, mas aquela gordurinha na parte inferior do abdômen simplesmente não sai. É frustrante olhar no espelho e ver que, não importa o esforço, a "pochete" continua lá, marcando nas roupas.',
    truth: 'Isso não é apenas gordura, é inflamação e resistência insulínica. Dietas modernas estressam seu corpo, elevando o cortisol, que sinaliza para o organismo armazenar gordura exatamente nessa região como um mecanismo de defesa primitivo.',
    solution: 'Os antigos egípcios não contavam calorias. Eles utilizavam combinações específicas de alimentos termogênicos e anti-inflamatórios que desativam o armazenamento de gordura por estresse. Nosso método reprograma seus hormônios para que seu corpo pare de se defender e comece a queimar essa gordura estocada como fonte primária de energia.'
  },
  {
    id: 'sanfona',
    title: 'O Efeito Sanfona',
    icon: <Activity className="w-8 h-8 text-[#D4AF37]" />,
    shortDesc: 'Perde peso sofrendo e ganha tudo de novo.',
    pain: 'Você perde 5kg sofrendo, e em poucas semanas ganha 7kg de volta. Parece um ciclo infinito de restrição e culpa, onde cada nova tentativa deixa seu corpo mais resistente ao emagrecimento e sua autoestima mais destruída.',
    truth: 'Dietas extremas destroem sua taxa metabólica basal. Seu corpo entra em "modo de sobrevivência", reduzindo a queima de calorias e aumentando a fome. Quando você volta a comer normalmente, o corpo armazena tudo por medo de uma nova "fome".',
    solution: 'A Dieta Faraônica é baseada em abundância nutritiva, não em privação. Ao restaurar a saciedade com os macronutrientes corretos usados pelos construtores das pirâmides, seu corpo sai do modo de alerta. Você emagrece de forma constante, sem o rebote, porque seu cérebro entende que não há escassez.'
  },
  {
    id: 'metabolismo',
    title: 'Metabolismo Travado',
    icon: <Flame className="w-8 h-8 text-[#D4AF37]" />,
    shortDesc: 'Come pouco, faz exercícios e não emagrece.',
    pain: 'Você come menos que todo mundo, faz exercícios, mas a balança simplesmente não se move. Parece que até beber água engorda. A sensação é de que seu corpo está lutando contra você.',
    truth: 'Seu metabolismo está "adormecido" devido a anos de toxinas industriais e dietas ioiô. A tireoide e o fígado, principais responsáveis pela queima de gordura, estão sobrecarregados, inflamados e lentos.',
    solution: 'O segredo egípcio envolve rituais matinais de purificação e o uso de especiarias ancestrais que atuam como "ignição" metabólica. Nosso protocolo limpa os receptores hormonais, reativando a fornalha natural do seu corpo para queimar calorias até mesmo em absoluto repouso.'
  },
  {
    id: 'flacidez',
    title: 'Flacidez e Falta de Tônus',
    icon: <Dumbbell className="w-8 h-8 text-[#D4AF37]" />,
    shortDesc: 'Corpo "mole" e pele sem elasticidade.',
    pain: 'Você até consegue perder peso, mas o corpo fica flácido, sem forma. A pele perde a elasticidade e você sente vergonha de usar roupas mais curtas ou ir à praia, mesmo estando mais magra.',
    truth: 'A perda de peso rápida sem a nutrição adequada consome sua massa muscular e destrói o colágeno. Você não está apenas perdendo gordura, está perdendo a estrutura e a sustentação do seu corpo.',
    solution: 'A alimentação no Antigo Egito era rica em aminoácidos biodisponíveis e minerais construtores. O método foca em nutrir a fáscia e os músculos, garantindo que, enquanto a gordura derrete, a pele retraia e o corpo ganhe um contorno firme, jovem e esculpido.'
  },
  {
    id: 'compulsao',
    title: 'Fome Constante e Compulsão',
    icon: <Brain className="w-8 h-8 text-[#D4AF37]" />,
    shortDesc: 'Ansiedade e perda de controle com a comida.',
    pain: 'A ansiedade bate e você perde o controle. A vontade de comer doces ou carboidratos à noite é incontrolável, gerando um sentimento terrível de culpa e fracasso no dia seguinte.',
    truth: 'Isso não é falta de caráter ou força de vontade. É um desequilíbrio químico. Picos e quedas de glicose no sangue, aliados a um intestino desregulado, enviam sinais de emergência para o cérebro exigindo energia rápida (açúcar).',
    solution: 'Focamos na estabilização glicêmica através de fibras ancestrais e gorduras boas. Ao curar a flora intestinal com os mesmos princípios usados no vale do Nilo, silenciamos os "gritos" por açúcar. Você retoma o controle absoluto sobre suas escolhas alimentares, sem sofrimento.'
  },
  {
    id: 'energia',
    title: 'Baixa Energia e Cansaço',
    icon: <Battery className="w-8 h-8 text-[#D4AF37]" />,
    shortDesc: 'Exaustão crônica e falta de disposição.',
    pain: 'Você acorda já se sentindo exausto. Precisa de litros de café para funcionar e, no meio da tarde, sente um "apagão" de energia. Fazer exercícios parece uma tarefa impossível e dolorosa.',
    truth: 'Suas células não estão conseguindo produzir ATP (energia) de forma eficiente. O excesso de carboidratos refinados causa inflamação celular, bloqueando a entrada de nutrientes vitais nas suas células.',
    solution: 'Ao mudar o combustível do seu corpo de "açúcar rápido" para "gordura estocada" (um processo que os egípcios dominavam intuitivamente), você experimenta uma clareza mental e uma energia inesgotável. Você terá a vitalidade necessária não apenas para emagrecer, mas para viver plenamente.'
  }
];

export const ProblemPage: React.FC<ProblemPageProps> = ({ 
  onBack
}) => {
  const [selectedPain, setSelectedPain] = useState<PainPoint | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-[#D4AF37] selection:text-black pb-8">

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]"></div>
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
              A Raiz do Seu Problema <br className="hidden md:block"/>
              <span className="text-golden-gradient">Não é a Sua Força de Vontade.</span>
            </h1>
            <p className="text-base md:text-lg text-white max-w-3xl mx-auto leading-relaxed">
              A indústria do emagrecimento mentiu para você. Descubra a verdadeira causa por trás de cada um dos seus maiores obstáculos na perda de peso e como a <strong className="text-golden-gradient">sabedoria milenar egípcia</strong> tem a chave para a cura definitiva.
            </p>
            <p className="mt-8 text-sm uppercase tracking-widest text-golden-gradient font-bold">
              Selecione abaixo o que mais te incomoda hoje:
            </p>
          </motion.div>
        </div>
      </div>

      {/* Grid of Pain Points */}
      <div className="container mx-auto px-2 md:px-4 max-w-4xl">
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          {painPoints.map((pain, index) => (
            <motion.button
              key={pain.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => setSelectedPain(pain)}
              className="group relative bg-gray-900/50 border border-gray-800 hover:border-[#D4AF37]/50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:-translate-y-1 overflow-hidden flex flex-col items-center justify-center aspect-square"
            >
              <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-[#D4AF37]/5 rounded-bl-full -mr-8 -mt-8 md:-mr-12 md:-mt-12 transition-transform group-hover:scale-110"></div>
              
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="bg-black/50 w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center border border-gray-800 group-hover:border-[#D4AF37]/30 mb-3 md:mb-4 transition-colors">
                  {React.cloneElement(pain.icon as React.ReactElement, { className: "w-5 h-5 md:w-7 md:h-7 text-[#D4AF37]" })}
                </div>
                <h3 className="text-sm md:text-lg font-display font-bold text-golden-gradient mb-1 md:mb-2 transition-colors leading-tight">
                  {pain.title}
                </h3>
                <p className="text-[10px] md:text-sm text-white leading-snug line-clamp-2 md:line-clamp-3">
                  {pain.shortDesc}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPain && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPain(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[600px] max-h-[100dvh] md:max-h-[85vh] bg-[#0a0a0a] md:rounded-3xl z-[70] overflow-y-auto border-t md:border border-[#D4AF37]/20 shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black rounded-lg border border-gray-800">
                    {selectedPain.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold text-white">
                    {selectedPain.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPain(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 md:p-8 space-y-6">
                {/* A Dor */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    A Sua Dor
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {selectedPain.pain}
                  </p>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>

                {/* A Verdade */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                    A Causa Oculta
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {selectedPain.truth}
                  </p>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>

                {/* A Solução */}
                <div className="space-y-2 bg-[#D4AF37]/5 p-4 md:p-6 rounded-2xl border border-[#D4AF37]/20">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></span>
                    A Solução Faraônica
                  </h4>
                  <p className="text-white leading-relaxed text-sm md:text-base">
                    {selectedPain.solution}
                  </p>
                </div>
                
                <div className="pt-2 text-center">
                  <button 
                    onClick={() => {
                      setSelectedPain(null);
                      onBack();
                      setTimeout(() => {
                        window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        });
                      }, 100);
                    }}
                    className="w-full btn-primary golden-gradient-glow text-black font-bold py-3 md:py-4 rounded-xl text-sm md:text-base uppercase tracking-wider"
                  >
                    Quero Resolver Isso Agora
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};
