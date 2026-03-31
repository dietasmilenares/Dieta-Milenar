import React from 'react';
import { motion } from 'motion/react';
import { Crown, Flame } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Footer } from './Footer';
import { Pricing } from './Pricing';

interface PlansPageProps {
  onBack: () => void;
  onSelectPlan: (name: string, price: string, paymentLink?: string) => void;
}

export const PlansPage: React.FC<PlansPageProps> = ({ onBack, onSelectPlan }) => {
  const { globalSettings } = useData();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const plans = [
    {
      name: "Protocolo Essencial",
      price: 97,
      oldPrice: 197,
      description: "O despertar para a sabedoria ancestral.",
      features: [
        "Guia Completo da Dieta Milenar",
        "Lista de Alimentos Sagrados",
        "Protocolo de Desintoxicação de 7 dias",
        "Acesso vitalício à plataforma",
        "Suporte via comunidade"
      ],
      recommended: false,
      icon: <Flame className="w-8 h-8 text-gray-400" />
    },
    {
      name: "Protocolo Imperial",
      price: 147,
      oldPrice: 297,
      description: "A transformação completa para quem busca o máximo.",
      features: [
        "Tudo do Protocolo Essencial",
        "Receitas Milenares Exclusivas",
        "Guia de Chás e Elixires Egípcios",
        "Protocolo de Jejum Intermitente Sagrado",
        "Bônus: Mentalidade de Aço",
        "Acesso Prioritário ao Suporte"
      ],
      recommended: true,
      icon: <Crown className="w-10 h-10 text-[#D4AF37]" />
    }
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37] selection:text-black">
      <main className="pt-32 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Plans Grid */}
          <Pricing onSelectPlan={onSelectPlan} />

          {/* Persuasive Footer Note */}
          <div className="mt-24 bg-gray-900/30 border border-gray-800 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Ainda com dúvida?</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Lembre-se: você não está apenas comprando um guia de dieta. Você está investindo em um novo estilo de vida, baseado em milênios de sabedoria que foram esquecidos pela indústria moderna. Se em 30 dias você não sentir a diferença, nós devolvemos cada centavo.
            </p>
            <button 
              onClick={onBack}
              className="text-[#D4AF37] hover:underline text-sm font-bold uppercase tracking-widest"
            >
              Quero ler mais sobre o método antes de decidir
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
