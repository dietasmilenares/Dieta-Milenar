import { RatingSystem } from '../components/RatingSystem';

export const SocialProofSection = () => {
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-heading font-bold text-gold mb-6">
            O Que Dizem Nossos Membros
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Milhares de pessoas já transformaram suas vidas com a Dieta Milenar.
            Não é mágica, é ciência ancestral aplicada.
          </p>
          <RatingSystem />
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gold/20 blur-xl rounded-full opacity-50"></div>
          <img 
            src="https://picsum.photos/seed/egypt-statue/600/400" 
            alt="Ancient Wisdom" 
            className="relative rounded-lg shadow-2xl border border-gold/20 opacity-90 hover:opacity-100 transition-opacity duration-500 z-10"
          />
        </div>
      </div>
    </section>
  );
};
