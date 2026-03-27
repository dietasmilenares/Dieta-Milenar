import { useContent } from '../hooks/useContent';
import { motion } from 'motion/react';
import { Star, StarHalf } from 'lucide-react';
import { useEffect, useState } from 'react';

// Generate 50 mock testimonials if they don't exist in content
const generateMockTestimonials = () => {
  const names = ["Ana Silva", "Carlos Oliveira", "Mariana Santos", "Pedro Costa", "Juliana Lima", "Roberto Souza", "Fernanda Alves", "Ricardo Pereira", "Camila Rocha", "Lucas Mendes"];
  const cities = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Porto Alegre, RS", "Salvador, BA", "Brasília, DF", "Fortaleza, CE", "Recife, PE", "Manaus, AM"];
  const results = ["-5kg em 2 semanas", "-12kg em 1 mês", "-8kg em 20 dias", "-15kg em 2 meses", "-4kg na primeira semana", "-20kg em 3 meses", "-6kg em 15 dias", "-10kg em 40 dias", "-7kg em 3 semanas", "-18kg em 10 semanas"];
  
  return Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    name: names[i % names.length],
    city: cities[i % cities.length],
    result: results[i % results.length],
    rating: (4.5 + Math.random() * 0.4).toFixed(1),
    text: "Simplesmente incrível. Nunca imaginei que funcionaria tão rápido sem passar fome.",
    image: `https://picsum.photos/seed/${i + 100}/100/100`
  }));
};

export const TestimonialsSection = () => {
  const { content } = useContent();
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    if (content.testimonials.items && content.testimonials.items.length > 0) {
      setTestimonials(content.testimonials.items);
    } else {
      setTestimonials(generateMockTestimonials());
    }
  }, [content.testimonials.items]);

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gold mb-4">
          {content.testimonials.title}
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          {content.testimonials.subtitle}
        </p>
      </div>

      {/* Infinite Carousel */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
        
        <div className="flex gap-6 animate-scroll w-max hover:pause">
          {[...testimonials, ...testimonials].map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="w-80 bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex-shrink-0 hover:border-gold/30 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-12 h-12 rounded-full object-cover border border-gold/50"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-white font-bold text-sm">{item.name}</h4>
                  <p className="text-gray-500 text-xs">{item.city}</p>
                </div>
              </div>
              
              <div className="flex gap-1 text-gold mb-3 text-xs">
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <StarHalf className="w-3 h-3 fill-current" />
                <span className="text-white ml-1">{item.rating}</span>
              </div>
              
              <p className="text-gray-300 text-sm italic mb-3">"{item.text}"</p>
              
              <div className="inline-block bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded border border-green-900/50 font-mono">
                {item.result}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center mt-8 text-xs text-gray-600">
        {content.testimonials.disclaimer}
      </div>
      
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
