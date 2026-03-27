import React from 'react';
import { motion } from 'motion/react';
import { Button } from './Button';
import { PlayCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

interface HeroProps {
  onCTAClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCTAClick }) => {
  const { globalSettings } = useData();
  const [isPlaying, setIsPlaying] = React.useState(false);

  const renderVideo = () => {
    if (globalSettings.heroVideoUrl) {
      let videoUrl = globalSettings.heroVideoUrl;

      // If it looks like an iframe tag, we still have to render it raw
      if (videoUrl.includes('<iframe')) {
        return (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: videoUrl }} 
          />
        );
      }
      
      // If it's a URL (YouTube/Vimeo/etc)
      if (!isPlaying) {
        return (
          <div 
            className="absolute inset-0 z-20 flex items-center justify-center bg-black group cursor-pointer"
            onClick={() => setIsPlaying(true)}
          >
            <div className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center pl-2 shadow-[0_0_50px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform duration-300 border border-white/20">
              <PlayCircle size={48} className="text-black fill-white" />
            </div>
          </div>
        );
      }

      const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };

      const ytId = getYouTubeId(videoUrl);

      if (ytId) {
        return (
          <div className="relative w-full h-full overflow-hidden bg-black rounded-xl group">
            <div 
              className={`absolute inset-0 z-30 cursor-pointer flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100 bg-black/40'}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {!isPlaying && (
                <div className="w-20 h-20 bg-[#D4AF37]/90 rounded-full flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-110 transition-transform border border-white/20">
                  <PlayCircle size={40} className="text-black fill-white" />
                </div>
              )}
            </div>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=${isPlaying ? 1 : 0}&controls=0&modestbranding=1&rel=0&fs=0&iv_load_policy=3&disablekb=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 w-full h-full pointer-events-none"
            ></iframe>
          </div>
        );
      }

      return (
        <div className="relative w-full h-full overflow-hidden bg-black rounded-xl group">
          <div 
            className={`absolute inset-0 z-30 cursor-pointer flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100 bg-black/40'}`}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {!isPlaying && (
              <div className="w-20 h-20 bg-[#D4AF37]/90 rounded-full flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-110 transition-transform border border-white/20">
                <PlayCircle size={40} className="text-black fill-white" />
              </div>
            )}
          </div>
          {videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.endsWith('.ogg') ? (
            <video
              src={videoUrl}
              autoPlay={isPlaying}
              controls={false}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              playsInline
              muted
              loop
            />
          ) : (
            <iframe
              src={videoUrl}
              className="absolute inset-0 w-full h-full pointer-events-none"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      );
    }

    // Default Placeholder
    return (
      <>
        <img 
          src="https://picsum.photos/seed/egypt-video/800/450" 
          alt="Video Cover" 
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500 grayscale hover:grayscale-0" 
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-[#D4AF37]/90 rounded-full flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(212,175,55,0.6)] group-hover:scale-110 transition-transform border border-white/20">
            <PlayCircle size={40} className="text-black fill-white" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 rounded text-xs font-bold border border-white/10 text-[#D4AF37]">
          ASSISTA AO VÍDEO (02:15)
        </div>
      </>
    );
  };

  return (
    <section id="hero" className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Gold overlay effect */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left relative z-20"
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-block px-4 py-2 bg-white/10 rounded-full text-xs md:text-sm font-bold mb-4 md:mb-6 backdrop-blur-sm border border-[#D4AF37]/50 text-golden-gradient"
            >
              🏺 O Segredo dos Faraós Revelado
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold font-display leading-[1.1] mb-4 md:mb-6 text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              Corpos <span className="italic font-heading font-bold text-golden-gradient">Esculpidos</span> <span className="hidden sm:inline"><br/></span>
              <span className="text-golden-gradient drop-shadow-sm">
                Sem Academia
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-sm sm:text-base md:text-xl text-white mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light"
            >
              Por que homens e mulheres do Antigo Egito tinham corpos fortes e definidos sem suplementos?
            </motion.p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button onClick={onCTAClick} size="md" className="shadow-2xl shadow-[#D4AF37]/30 w-full sm:w-auto text-sm sm:text-base border border-[#D4AF37]/50 shine-effect hover:scale-105 transition-transform duration-300">
                QUERO DESCOBRIR O MÉTODO
              </Button>
              
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="flex items-center gap-2 text-[10px] sm:text-sm font-medium opacity-90 text-golden-gradient leading-tight text-center sm:text-left max-w-[200px] sm:max-w-none"
              >
                <img 
                  src="https://static.vecteezy.com/system/resources/thumbnails/067/855/578/small/eye-of-horus-egyptian-symbol-in-golden-gradient-png.png" 
                  alt="Olho de Hórus" 
                  className="w-8 h-8 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                  referrerPolicy="no-referrer"
                />
                <span>Descubra o padrão alimentar histórico que a indústria esconde de você.</span>
              </motion.div>
            </div>


          </motion.div>

          {/* Video / Iframe Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-xl"
          >
            <div className="relative aspect-video rounded-2xl bg-white/5 backdrop-blur-md shadow-2xl border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] overflow-hidden group cursor-pointer">
              {renderVideo()}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 flex flex-col items-center gap-2 text-sm text-white"
            >
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <span className="font-medium text-center">4.9/5 baseado em 2.347 avaliações</span>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};