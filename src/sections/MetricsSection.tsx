import { useContent } from '../hooks/useContent';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const Counter = ({ value, label }: { value: string, label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Simple parsing for numbers like "8.000" or "98%"
  const numericValue = parseInt(value.replace(/\D/g, ''));
  const suffix = value.includes('%') ? '%' : '';
  const isThousands = value.includes('.');

  return (
    <div ref={ref} className="text-center p-6 border border-gold/10 bg-zinc-900/30 rounded-lg backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold text-gold mb-2 font-heading"
      >
        {value}
      </motion.div>
      <div className="text-gray-400 uppercase tracking-widest text-xs font-medium">
        {label}
      </div>
    </div>
  );
};

export const MetricsSection = () => {
  const { content } = useContent();
  const { metrics } = content;

  return (
    <section className="py-16 bg-gradient-to-b from-black to-zinc-900 border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <Counter value={metrics.buyers} label={metrics.buyersLabel} />
          <Counter value={metrics.satisfaction} label={metrics.satisfactionLabel} />
          <Counter value={metrics.rating} label={metrics.ratingLabel} />
          <Counter value={metrics.recommendation} label={metrics.recommendationLabel} />
        </div>
      </div>
    </section>
  );
};
