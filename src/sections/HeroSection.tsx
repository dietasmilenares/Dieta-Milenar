import { motion } from 'motion/react';
import { useContent } from '../hooks/useContent';

export const HeroSection = () => {
  const { content } = useContent();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden pt-16">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black z-10"></div>
        <img 
          src="https://picsum.photos/seed/egypt/1920/1080?grayscale&blur=2" 
          alt="Background" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="container mx-auto px-4 z-20 relative text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block py-1 px-3 rounded-full border border-gold/50 text-gold text-sm tracking-[0.2em] uppercase mb-6 bg-black/50 backdrop-blur-sm">
            {content.hero.title}
          </span>
          
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {content.hero.headline}
          </h1>
          
          <p className="text-sand text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            {content.hero.subheadline}
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-gold to-yellow-600 text-black font-bold text-lg md:text-xl py-4 px-10 rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_rgba(212,175,55,0.7)] transition-all uppercase tracking-wider"
          >
            {content.hero.cta}
          </motion.button>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {content.hero.secureBadge}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
