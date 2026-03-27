import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Play, ArrowLeft, Clock, TrendingUp, Users, CheckCircle2, PlayCircle, ShieldCheck } from 'lucide-react';
import { Footer } from './Footer';

interface TestimonialsPageProps {
  onBack: () => void;
  onRegisterClick?: () => void;
  onTesteClick?: () => void;
  onProblemClick?: () => void;
  onAboutUsClick?: () => void;
  onPlansPageClick?: () => void;
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({ 
  onBack,
  onProblemClick
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const videoUrl = "https://www.youtube.com/watch?v=hnoyUCJmtss";

  const renderVideo = () => {
    if (!isPlaying) {
      return (
        <div 
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 group cursor-pointer"
          onClick={() => {
            setIsPlaying(true);
            setIsPaused(false);
          }}
        >
          <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center pl-1 shadow-[0_0_50px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform duration-300 border border-white/20">
            <PlayCircle size={40} className="text-black fill-white" />
          </div>
          <img 
            src={`https://img.youtube.com/vi/hnoyUCJmtss/maxresdefault.jpg`}
            alt="Video Thumbnail"
            className="absolute inset-0 w-full h-full object-cover -z-10 opacity-60"
            referrerPolicy="no-referrer"
          />
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
        <div className="relative w-full h-full overflow-hidden bg-black rounded-xl">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3`}
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          ></iframe>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full overflow-hidden bg-black rounded-xl">
        {/* Transparent overlay to capture play/pause clicks and hide YouTube interactions */}
        <div 
          className="absolute inset-0 z-30 cursor-pointer" 
          onClick={togglePlayPause}
        >
          {/* Minimalist Pause/Play Indicator on hover when playing */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
            <div className="w-20 h-20 bg-[#D4AF37]/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
              {isPaused ? (
                <PlayCircle size={40} className="text-black fill-white ml-1" />
              ) : (
                <div className="flex gap-2">
                  <div className="w-2.5 h-10 bg-black rounded-full" />
                  <div className="w-2.5 h-10 bg-black rounded-full" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute inset-0" style={{ top: '-15%', bottom: '-15%', left: '-5%', right: '-5%' }}>
          {videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.endsWith('.ogg') ? (
            <video
              src={videoUrl}
              autoPlay={!isPaused}
              controls={false}
              className="absolute w-[110%] h-[130%] object-cover"
              style={{ top: '-15%', left: '-5%' }}
              playsInline
              muted
              loop
            />
          ) : (
            <iframe
              src={videoUrl}
              className="absolute w-[110%] h-[130%]"
              style={{ top: '-15%', left: '-5%' }}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    );
  };

  const testimonials = [
    {
      id: 1,
      name: "Ivan Souza",
      age: 35,
      lost: "24kg",
      time: "2 meses",
      videoThumbnail: "https://i.ibb.co/20FYh56r/file-000000005f5071f581571c6c3c54db24.png",
      rating: 5,
      quote: "Eu quebrei foi a cara com essa dieta... rsrs, acontece que alguns anos atrás eu doei todas as minhas roupas de quando eu era magro para o meu primo, então eu quebrei a cara pois tive que voltar no meu primo e pedir todas as roupas de volta... Como diz a música... Tá ruim mas tá baum... Tô muito feliz"
    },
    {
      id: 2,
      name: "Ana María",
      age: 26,
      lost: "12kg",
      time: "2 meses",
      videoThumbnail: "https://i.ibb.co/bMrKjLrL/file-000000001ecc720eaac14125b3747894.png",
      rating: 5,
      quote: "Meu relacionamento já estava acabado, meu namorado era gordinho e ficou fitness fazendo musculação e academia... E como eu odeio academia eu nunca quis ir. Há pouco tempo eu conheci o sistema de dieta milenar e meu relacionamento foi restaurado."
    }
  ];

  const renderProofImage = (testimonial: any) => (
    <div className="p-1.5 bg-gradient-to-r from-[#422006] via-[#FFD700] to-[#422006] shadow-[0_0_15px_rgba(212,175,55,0.3)] rounded-2xl overflow-hidden max-w-md mx-auto my-8 flex items-center">
      <div className="relative aspect-[9/14] overflow-hidden bg-black rounded-xl w-full">
        {/* Inner Frame Line */}
        <div className="absolute inset-0 border border-[#422006]/20 z-20 pointer-events-none"></div>

        {/* Vertical Metallic Divider with Flare */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-r from-[#422006] via-[#FFD700] to-[#422006] z-20 shadow-[0_0_4px_rgba(0,0,0,0.9)]">
          {/* Light Flare */}
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-6 h-6 bg-[#FFD700] rounded-full blur-md opacity-60"></div>
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white blur-[1px] shadow-[0_0_10px_white]"></div>
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-0.5 h-12 bg-white blur-[1px] shadow-[0_0_10px_white]"></div>
        </div>

        <img 
          src={testimonial.videoThumbnail} 
          alt={`Antes e depois de ${testimonial.name}`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Name at Top Left */}
        <div className="absolute top-4 left-[6px] z-30">
          <h3 className="text-sm font-bold text-white font-heading drop-shadow-lg uppercase bg-black/40 backdrop-blur-sm px-3 py-1 rounded-sm border border-white/10">
            {testimonial.name}, {testimonial.age}
          </h3>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <span className="bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider shadow-lg">
                PERDEU {testimonial.lost}
              </span>
            </div>
            <span className="bg-black/80 text-[#D4AF37] text-[10px] font-bold px-3 py-1 rounded-sm border border-[#D4AF37]/50 backdrop-blur-sm uppercase tracking-widest">
              EM DOIS MESES
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTestimonialCard = (testimonial: any) => (
    <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#D4AF37]/30 max-w-sm mx-auto mb-16 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#D4AF37]/50 rounded-tl-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#D4AF37]/50 rounded-tr-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#D4AF37]/50 rounded-bl-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#D4AF37]/50 rounded-br-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex flex-col items-center mb-6">
        <h4 className="text-[#D4AF37] font-bold text-xs uppercase tracking-[0.2em] mb-2">{testimonial.name}</h4>
        <div className="flex gap-1 justify-center">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
          ))}
        </div>
      </div>
      <p className="text-white text-base md:text-lg italic mb-8 leading-relaxed relative z-10 text-center font-heading">"{testimonial.quote}"</p>
      <div className="flex flex-col items-center text-center border-t border-[#D4AF37]/10 pt-6">
        <p className="text-gray-500 text-[10px] uppercase tracking-wider">PERDEU {testimonial.lost}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-8 px-4 selection:bg-[#D4AF37] selection:text-black relative">
      {/* Thematic Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyros.png')] opacity-10 pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto relative z-10 px-4 md:px-8">
        {/* 1⃣ TÍTULO PRINCIPAL (TOPO) */}
        <div className="text-center mb-8">
          <span className="text-[#D4AF37] font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs">Transformação Real</span>
          <h1 className="text-3xl md:text-5xl font-bold font-display text-white mt-3 leading-tight px-4">
            O Segredo Que Está Fazendo Pessoas Comuns <br className="hidden md:block" />
            <span className="text-golden-gradient italic font-heading font-bold">Derreterem Gordura</span>
          </h1>

          {/* 2⃣ VÍDEO DO YOUTUBE (MOVIDO PARA BAIXO DA FRASE) */}
          <div className="my-8 relative rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-[0_0_50px_rgba(212,175,55,0.15)] aspect-video bg-[#0a0a0a] group cursor-pointer">
            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37]/60 rounded-tl-2xl pointer-events-none z-40"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#D4AF37]/60 rounded-tr-2xl pointer-events-none z-40"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#D4AF37]/60 rounded-bl-2xl pointer-events-none z-40"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37]/60 rounded-br-2xl pointer-events-none z-40"></div>
            {renderVideo()}
          </div>

          <p className="text-white text-sm md:text-lg max-w-2xl mx-auto mt-4 leading-relaxed px-4">
            Descubra como um método ancestral, ignorado pela indústria do emagrecimento, está devolvendo a alegria de se olhar no espelho para mais de 15 mil pessoas.
          </p>
        </div>

        {/* 3⃣ BLOCO DE MÉTRICAS DE CRESCIMENTO */}
        {/* Métricas removidas conforme solicitado */}

        {/* 4⃣ SUBTÍTULO (TÍTULO DA CARTA) */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white font-display leading-tight">
            <img 
              src="https://static.vecteezy.com/system/resources/thumbnails/067/855/578/small/eye-of-horus-egyptian-symbol-in-golden-gradient-png.png" 
              alt="Olho de Hórus" 
              className="w-8 h-8 object-contain inline-block mr-2"
              referrerPolicy="no-referrer"
            />
            Você Está Cansado de Lutar Contra a Balança e <br className="hidden md:block" />
            <span className="text-golden-gradient italic font-heading font-bold">Sempre Perder?</span>
          </h2>
        </div>

        {/* 5⃣ TEXTO PERSUASIVO — ABERTURA DA CARTA */}
        <div className="space-y-8 text-gray-300 leading-relaxed font-sans mb-16">
          <section className="relative">
            <div className="space-y-6 text-base md:text-lg text-white text-center">
              <p>
                <span className="text-[#D4AF37] block">Se você chegou até aqui, eu sei exatamente como você se sente:</span> Você já tentou de tudo. Dietas malucas, chás milagrosos, horas intermináveis na esteira, restrições que te deixam de mau humor e com fome o dia inteiro. E o pior? Quando você sobe na balança, o número parece rir da sua cara.
              </p>
              <p>
                A frustração de vestir uma roupa que você ama e ver que ela não serve mais. O olhar no espelho que traz tristeza ao invés de orgulho. A sensação de que o seu próprio corpo se tornou uma prisão.
              </p>
              <p className="text-white font-semibold p-6 bg-gradient-to-b from-[#D4AF37]/10 to-transparent rounded-2xl border-t-2 border-[#D4AF37]">
                <span className="text-[#D4AF37] block mb-2">Mas eu preciso te dizer uma verdade libertadora:</span> <span className="text-red-500 font-bold">A CULPA NÃO É SUA.</span>
              </p>
              <p>
                A indústria farmacêutica lucra bilhões todos os anos através da <span className="text-[#D4AF37] font-bold uppercase">SAGA IR E VIR DO SISTEMA DE EMAGRECIMENTO, CONHECIDO TAMBÉM COMO EFEITO SANFONA.</span>  A indústria de medicamento não quer ver você curado, eles querem você preso em um ciclo de perda e reganho de peso. Eles não querem que você descubra que a verdadeira transformação não exige sofrimento extremo, mas sim a ativação correta do seu metabolismo através de sabedorias ancestrais validadas pela ciência e escondida.
              </p>
            </div>
          </section>
        </div>

        {/* 6⃣ PRIMEIRA PROVA VISUAL (FOTO DA MOÇA) */}
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white font-display">
            Dificuldades reais
          </h3>
          <h3 className="text-2xl md:text-3xl font-bold text-white font-display mt-2">
            <span className="text-[#D4AF37]">Resultados reais</span>
          </h3>
        </div>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-16">
          <div className="w-full md:w-1/2 mx-auto">
            {renderProofImage(testimonials[1])}
          </div>
        </div>

        {renderTestimonialCard(testimonials[1])}

        {/* 7⃣ TEXTO PERSUASIVO — PROVA E IDENTIFICAÇÃO */}
        <div className="space-y-8 text-gray-300 leading-relaxed font-sans mb-16">
          <section className="relative">
            <div className="space-y-6 text-base md:text-lg text-gray-400 text-center">
              <p className="text-white">
                Olhe para a Ana María. Ela é uma pessoa comum, com uma rotina corrida, assim como você. Ela não tem tempo para passar 3 horas na academia ou cozinhar refeições complexas.
              </p>
              <p className="text-white">
                O que mudou? Ela parou de lutar contra o próprio corpo e começou a usar um método validado a seu favor. Não foi sorte. Não foi genética. Foi a aplicação de um passo a passo simples que reprogramou o corpo dela para queimar gordura de forma automática.
              </p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-heading italic mt-6 font-bold">
                <span className="text-[#D4AF37]">E se ela conseguiu,</span> <span className="text-green-500">Você também consegue.</span>
              </p>
            </div>
          </section>
        </div>

        {/* 8⃣ SEGUNDA PROVA VISUAL (FOTO DO RAPAZ) */}
        {renderProofImage(testimonials[0])}

        {/* DEPOIMENTO DO IVAN */}
        {renderTestimonialCard(testimonials[0])}

        {/* 9⃣ TEXTO PERSUASIVO — FECHAMENTO */}
        <div className="space-y-8 text-gray-300 leading-relaxed font-sans mb-16">
          <section className="relative">
            <div className="space-y-6 text-base md:text-lg text-gray-400 text-center">
              <p className="text-white">
                O Ivan achava que nunca mais usaria suas roupas antigas. Hoje, ele é a prova viva de que nunca é tarde para retomar o controle da própria vida e da própria saúde.
              </p>
              <p className="text-white">
                Agora, você tem uma escolha nas mãos. Você pode fechar esta página, continuar fazendo o que sempre fez e continuar colhendo os mesmos resultados frustrantes.
              </p>
              <p className="text-xl md:text-2xl font-heading italic text-[#D4AF37] mt-6 font-bold">
                Ou você pode tomar a decisão que vai mudar o rumo da sua história.
              </p>
            </div>
          </section>
          
          <div className="bg-gradient-to-b from-[#D4AF37]/10 to-transparent p-8 rounded-2xl border border-[#D4AF37]/10 relative overflow-hidden mt-8 text-center">
            <h3 className="text-[#D4AF37] font-bold text-lg md:text-xl mb-3 flex items-center justify-center gap-3 font-heading tracking-wide">
              <Clock className="animate-pulse" size={24} /> 
              ATENÇÃO, OPORTUNIDADE ÚNICA
            </h3>
            <p className="text-sm md:text-base text-white relative z-10 leading-relaxed">
              As vagas para a nossa comunidade exclusiva estão se esgotando rapidamente. Não podemos garantir que esta oferta e este método estarão disponíveis amanhã. O momento de agir é agora.
            </p>
          </div>
        </div>

        {/* 🔟 BOTÃO FINAL (CTA) */}
        <div className="text-center mt-8 mb-4">
          <button 
            onClick={() => {
              if (onProblemClick) {
                onProblemClick();
              } else {
                onBack();
              }
            }}
            className="golden-gradient-glow text-black font-bold py-4 px-8 md:px-12 rounded-full text-xs md:text-sm uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-3 mx-auto"
          >
            Continuar
            <ArrowLeft className="rotate-180" size={18} />
          </button>
          
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6">
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};
