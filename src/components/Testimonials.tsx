import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Testimonial } from '../types';
import { SectionDivider } from './SectionDivider';

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: "Ana Silva",
      age: 34,
      rating: 5,
      text: "Eu tentei de tudo: low carb, jejum, remédios. Nada funcionava a longo prazo. Com o método egípcio, perdi 8kg em 2 meses sem passar fome e minha energia triplicou.",
      avatar: "https://picsum.photos/seed/user1/100/100"
    },
    {
      id: '2',
      name: "Carla Mendes",
      age: 42,
      rating: 5,
      text: "Incrível como a gente complica a alimentação. Voltar ao básico e entender a combinação dos alimentos mudou meu corpo. Minhas roupas voltaram a servir!",
      avatar: "https://picsum.photos/seed/user2/100/100"
    },
    {
      id: '3',
      name: "Patrícia Souza",
      age: 29,
      rating: 5,
      text: "O que mais me impressionou foi a disposição. Eu vivia cansada. Agora acordo cedo e tenho energia o dia todo. E o melhor: comendo comida de verdade.",
      avatar: "https://picsum.photos/seed/user3/100/100"
    },
    {
      id: '4',
      name: "Juliana Rocha",
      age: 38,
      rating: 5,
      text: "Sempre achei que precisava de academia para ter um corpo definido. O protocolo me mostrou que a base é o que colocamos no prato. Resultados visíveis em 3 semanas!",
      avatar: "https://picsum.photos/seed/user4/100/100"
    },
    {
      id: '5',
      name: "Beatriz Lima",
      age: 45,
      rating: 5,
      text: "Minha saúde digestiva era um desastre. Seguindo os princípios milenares, não só emagreci, mas meu inchaço sumiu completamente. Me sinto 10 anos mais jovem.",
      avatar: "https://picsum.photos/seed/user5/100/100"
    }
  ];

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyros.png')] opacity-5 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <span className="text-golden-gradient font-bold tracking-[0.3em] uppercase text-xs md:text-sm">Vozes da Transformação</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold font-display text-white mt-2 mb-4">
            O que nossas <span className="italic text-golden-gradient">alunas dizem</span>
          </h2>
        </div>
        
        <div className="relative max-w-4xl mx-auto min-h-[450px] md:min-h-[380px] flex items-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full"
            >
              <div className="bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-[#D4AF37]/10 shadow-2xl flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden max-w-3xl mx-auto">
                <div className="relative shrink-0">
                  <img 
                    src={testimonials[currentIndex].avatar} 
                    alt={testimonials[currentIndex].name} 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-[#D4AF37] relative z-10" 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black p-1 rounded-full z-20">
                    <Star size={10} fill="currentColor" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start text-[#FFD700] mb-2 gap-0.5">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-white italic mb-4 leading-relaxed">
                    "{testimonials[currentIndex].text}"
                  </p>
                  <div>
                    <h4 className="text-base font-bold text-white font-heading">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-golden-gradient text-xs font-medium uppercase tracking-wider">
                      {testimonials[currentIndex].age} anos • Aluna Verificada
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button 
            onClick={prev}
            className="absolute left-0 md:-left-16 z-20 p-3 rounded-full bg-gray-900/80 border border-gray-800 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all hidden sm:flex"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={next}
            className="absolute right-0 md:-right-16 z-20 p-3 rounded-full bg-gray-900/80 border border-gray-800 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all hidden sm:flex"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-6 bg-[#D4AF37]' : 'w-1.5 bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
