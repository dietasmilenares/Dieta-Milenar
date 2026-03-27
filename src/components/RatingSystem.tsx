import { useContent } from '../hooks/useContent';
import { motion } from 'motion/react';
import { Star, StarHalf } from 'lucide-react';

export const RatingSystem = () => {
  const { content } = useContent();
  const { rating } = content;

  return (
    <div className="bg-zinc-900/50 p-6 rounded-lg border border-white/5 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="text-5xl font-bold text-white mb-2">{rating.average}</div>
        <div className="flex gap-1 text-gold mb-2">
          <Star fill="currentColor" className="w-6 h-6" />
          <Star fill="currentColor" className="w-6 h-6" />
          <Star fill="currentColor" className="w-6 h-6" />
          <Star fill="currentColor" className="w-6 h-6" />
          <StarHalf fill="currentColor" className="w-6 h-6" />
        </div>
        <div className="text-gray-400 text-sm mb-6">
          Baseado em {rating.totalReviews} avaliações
        </div>

        <div className="w-full space-y-2">
          {Object.entries(rating.distribution).reverse().map(([star, percent]) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="text-gray-400 w-3">{star}</span>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percent}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gold"
                ></motion.div>
              </div>
              <span className="text-gray-500 w-8 text-right">{percent}%</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-[10px] text-gray-600 uppercase tracking-wider">
          Dados demonstrativos
        </div>
      </div>
    </div>
  );
};
