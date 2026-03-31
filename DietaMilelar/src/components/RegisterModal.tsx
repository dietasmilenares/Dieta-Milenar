import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff, ChevronRight, ChevronLeft, Ruler, Weight, Calendar, Target, Activity, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import toast from 'react-hot-toast';
import { useData } from '../context/DataContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useData();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    activityLevel: '',
    goal: '',
    restrictions: ''
  });

  const handleNext = () => {
    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Informe um e-mail válido.');
        return;
      }
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        toast.error('Informe um telefone/WhatsApp válido com DDD (10 ou 11 dígitos).');
        return;
      }
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          gender: formData.gender,
          age: formData.age ? parseInt(formData.age) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseInt(formData.height) : null,
          activity_level: formData.activityLevel,
          goal: formData.goal,
          restrictions: formData.restrictions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar');
      // Salva token e popula currentUser no contexto antes de prosseguir
      localStorage.setItem('auth_token', data.token);
      await login(formData.email, formData.password);
      toast.success('Cadastro realizado com sucesso! Bem-vindo à jornada ancestral.');
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    } else {
      v = v.replace(/^(\d{0,2})$/, '$1');
    }
    updateFormData('phone', v);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-heading font-bold text-white uppercase tracking-widest">Identificação</h3>
              <p className="text-xs text-gray-500">Comece sua jornada criando sua identidade digital</p>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full bg-black/50 border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full bg-black/50 border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                <input
                  type="tel"
                  placeholder="WhatsApp (DDD + Número)"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  className="w-full bg-black/50 border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma Senha"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className="w-full bg-black/50 border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-10 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-heading font-bold text-white uppercase tracking-widest">Perfil Biométrico</h3>
              <p className="text-xs text-gray-500">Esses dados nos ajudam a calibrar o protocolo para você</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => updateFormData('gender', 'masculino')}
                  className={`flex-1 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest ${formData.gender === 'masculino' ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-black/50 border-[#D4AF37]/20 text-gray-400'}`}
                >
                  Masculino
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData('gender', 'feminino')}
                  className={`flex-1 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest ${formData.gender === 'feminino' ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-black/50 border-[#D4AF37]/20 text-gray-400'}`}
                >
                  Feminino
                </button>
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                <input
                  type="number"
                  placeholder="Idade"
                  value={formData.age}
                  onChange={(e) => updateFormData('age', e.target.value)}
                  className="w-full bg-black/50 border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                <input
                  type="number"
                  placeholder="Altura (cm)"
                  value={formData.height}
                  onChange={(e) => updateFormData('height', e.target.value)}
                  className="w-full bg-black/50 border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div className="relative col-span-2">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                <input
                  type="number"
                  placeholder="Peso Atual (kg)"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', e.target.value)}
                  className="w-full bg-black/50 border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-heading font-bold text-white uppercase tracking-widest">Estilo de Vida</h3>
              <p className="text-xs text-gray-500">O toque final para sua personalização milenar</p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Target className="absolute left-3 top-3 text-[#D4AF37]/50" size={18} />
                <select
                  value={formData.goal}
                  onChange={(e) => updateFormData('goal', e.target.value)}
                  className="w-full bg-black/50 border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] appearance-none"
                >
                  <option value="">Qual seu objetivo principal?</option>
                  <option value="perda">Perda de Peso</option>
                  <option value="ganho">Ganho de Massa</option>
                  <option value="saude">Saúde e Longevidade</option>
                  <option value="energia">Mais Energia</option>
                </select>
              </div>

              <div className="relative">
                <Activity className="absolute left-3 top-3 text-[#D4AF37]/50" size={18} />
                <select
                  value={formData.activityLevel}
                  onChange={(e) => updateFormData('activityLevel', e.target.value)}
                  className="w-full bg-black/50 border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] appearance-none"
                >
                  <option value="">Nível de Atividade Física</option>
                  <option value="sedentario">Sedentário</option>
                  <option value="leve">Leve (1-2x semana)</option>
                  <option value="moderado">Moderado (3-4x semana)</option>
                  <option value="intenso">Intenso (5x+ semana)</option>
                </select>
              </div>

              <div className="relative">
                <AlertTriangle className="absolute left-3 top-3 text-[#D4AF37]/50" size={18} />
                <textarea
                  placeholder="Restrições Alimentares ou Médicas (Opcional)"
                  value={formData.restrictions}
                  onChange={(e) => updateFormData('restrictions', e.target.value)}
                  className="w-full bg-black/50 border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] min-h-[80px]"
                />
              </div>

              <div className="flex items-start gap-2 px-1">
                <input type="checkbox" id="terms" className="mt-1 accent-[#D4AF37]" required />
                <label htmlFor="terms" className="text-[10px] text-gray-500 leading-tight">
                  Concordo com os Termos de Uso e Política de Privacidade baseados na sabedoria ancestral.
                </label>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border-2 border-[#D4AF37]/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] max-h-[90vh] overflow-y-auto"
          >
            {/* Thematic Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyros.png')] opacity-10 pointer-events-none"></div>
            
            <div className="p-6 md:p-10 relative z-10">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-[#D4AF37]/10 rounded-full transition-colors text-[#D4AF37]/60 hover:text-[#D4AF37]"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="flex justify-center mb-2">
                  <img 
                    src="https://static.vecteezy.com/system/resources/thumbnails/067/855/578/small/eye-of-horus-egyptian-symbol-in-golden-gradient-png.png" 
                    alt="Olho de Hórus" 
                    className="w-10 h-10 object-contain opacity-80"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-white">
                  Início da <span className="text-golden-gradient italic font-heading font-bold">Jornada</span>
                </h2>
                
                {/* Progress Bar */}
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-[#D4AF37]' : 'w-4 bg-gray-800'}`}
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="min-h-[320px]">
                  <AnimatePresence mode="wait">
                    {renderStep()}
                  </AnimatePresence>
                </div>

                <div className="mt-8 flex gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-3 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#D4AF37]/5 transition-colors"
                    >
                      <ChevronLeft size={16} /> Voltar
                    </button>
                  )}
                  
                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-[2] golden-gradient-glow text-black font-bold py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      Próximo Passo <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex-[2] golden-gradient-glow text-black font-bold py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      Finalizar Cadastro
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
