import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, BookOpen, CheckCircle, Lock, Menu, ChevronLeft, ChevronRight, Clock, Download, MessageCircle, FileText, StickyNote, Award, Users, Eye, Layers, Box, X, LogOut, Edit2, Save, Mail, Phone, Target, Activity, AlertTriangle, Ruler, Weight, Calendar, User, ArrowLeft, Share2, Copy, ChevronDown, Gift, Star, TrendingUp, Shield, CheckSquare, Square, Home } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Product, Module, Chapter, UserRole, BonusItem, Category, Ebook, BonusCategory, BonusItem_2 } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { CheckoutModal } from './CheckoutModal';
import { ProductCheckoutModal } from './ProductCheckoutModal';
import { EbookModal } from './EbookModal';
import { SupportTickets } from './SupportTickets';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

// ─── Tela de Perfil do Membro ─────────────────────────────────────────────────
const GOAL_LABELS: Record<string, string> = { perda: 'Perda de Peso', ganho: 'Ganho de Massa', saude: 'Saúde e Longevidade', energia: 'Mais Energia' };
const ACTIVITY_LABELS: Record<string, string> = { sedentario: 'Sedentário', leve: 'Leve (1-2x/sem)', moderado: 'Moderado (3-4x/sem)', intenso: 'Intenso (5x+/sem)' };
const GENDER_LABELS: Record<string, string> = { masculino: 'Masculino', feminino: 'Feminino', outro: 'Outro' };
const calcIMC = (w: number, h: number) => parseFloat((w / Math.pow(h / 100, 2)).toFixed(1));
const imcLabel = (imc: number) => imc < 18.5 ? 'Abaixo do peso' : imc < 25 ? 'Peso normal' : imc < 30 ? 'Sobrepeso' : 'Obesidade';

interface MemberProfileProps {
  onBack: () => void;
  currentUser: any;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ onBack, currentUser }) => {
  const token = localStorage.getItem('auth_token') || '';
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '', gender: '', age: '', height: '', weight: '',
    goal: '', activity_level: '', restrictions: '',
  });
  const [saved, setSaved] = useState({ ...draft });
  const profile = editing ? draft : saved;
  const u = (f: string, v: string) => setDraft(p => ({ ...p, [f]: v }));
  const imc = profile.weight && profile.height ? calcIMC(parseFloat(profile.weight), parseFloat(profile.height)) : null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const merged = {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          phone: data.phone || '',
          gender: data.gender || '',
          age: data.age ? String(data.age) : '',
          height: data.height ? String(data.height) : '',
          weight: data.weight ? String(data.weight) : '',
          goal: data.goal || '',
          activity_level: data.activity_level || '',
          restrictions: data.restrictions || '',
        };
        setSaved(merged);
        setDraft(merged);
      } catch {
        // sem perfil ainda, mantém vazio
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const nameEmailRes = await fetch(`/api/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: draft.name, email: draft.email }),
      });
      if (!nameEmailRes.ok) {
        const err = await nameEmailRes.json();
        toast.error(err.error || 'Erro ao salvar nome/e-mail');
        return;
      }
      const profileRes = await fetch(`/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          phone: draft.phone, gender: draft.gender,
          age: draft.age ? parseInt(draft.age) : null,
          height: draft.height ? parseInt(draft.height) : null,
          weight: draft.weight ? parseFloat(draft.weight) : null,
          activity_level: draft.activity_level, goal: draft.goal, restrictions: draft.restrictions,
        }),
      });
      if (!profileRes.ok) {
        toast.error('Erro ao salvar dados do perfil');
        return;
      }
      setSaved({ ...draft });
      setEditing(false);
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao salvar perfil');
    }
  };

  const rows = [
    { icon: <User size={18} className="text-[#D4AF37]" />,          label: 'NOME',       value: saved.name,                            field: 'name' },
    { icon: <Mail size={18} className="text-[#D4AF37]" />,          label: 'E-MAIL',     value: saved.email,                           field: 'email',          type: 'email' },
    { icon: <Phone size={18} className="text-[#D4AF37]" />,         label: 'WHATSAPP',   value: saved.phone,                           field: 'phone' },
    { icon: <Users size={18} className="text-[#D4AF37]" />,         label: 'GÊNERO',     value: GENDER_LABELS[saved.gender] || saved.gender, field: 'gender', options: GENDER_LABELS },
    { icon: <Calendar size={18} className="text-[#D4AF37]" />,      label: 'IDADE',      value: saved.age ? `${saved.age} anos` : '',  field: 'age',            type: 'number' },
    { icon: <Ruler size={18} className="text-[#D4AF37]" />,         label: 'ALTURA',     value: saved.height ? `${saved.height} cm` : '', field: 'height',      type: 'number' },
    { icon: <Weight size={18} className="text-[#D4AF37]" />,        label: 'PESO',       value: saved.weight ? `${saved.weight} kg` : '', field: 'weight',      type: 'number' },
    { icon: <Target size={18} className="text-[#D4AF37]" />,        label: 'OBJETIVO',   value: GOAL_LABELS[saved.goal] || '',         field: 'goal',           options: GOAL_LABELS },
    { icon: <Activity size={18} className="text-[#D4AF37]" />,      label: 'ATIVIDADE',  value: ACTIVITY_LABELS[saved.activity_level] || '', field: 'activity_level', options: ACTIVITY_LABELS },
    { icon: <AlertTriangle size={18} className="text-[#D4AF37]" />, label: 'RESTRIÇÕES', value: saved.restrictions,                    field: 'restrictions' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-black/90 backdrop-blur-md border-b border-gray-800 z-50 flex items-center px-4 gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white font-bold text-base flex-1">Meu Perfil</h1>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1.5 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1.5 rounded-lg">
              <Save size={12} /> Salvar
            </button>
            <button onClick={() => { setDraft({ ...saved }); setEditing(false); }} className="p-1.5 bg-gray-800 text-gray-400 rounded-lg">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 bg-[#1a1400] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold px-3 py-1.5 rounded-lg">
            <Edit2 size={12} /> Editar
          </button>
        )}
      </div>

      {loading ? (
        <div className="pt-20 flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
        </div>
      ) : (
      <div className="pt-20 pb-12 px-4 max-w-lg mx-auto">
        <div className="bg-[#0d0b00] border border-[#D4AF37]/30 rounded-2xl overflow-hidden">

          {/* Avatar + nome + IMC */}
          <div className="flex items-center gap-4 p-4 border-b border-[#D4AF37]/15">
            <div className="w-11 h-11 rounded-full bg-[#D4AF37]/15 border-2 border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-black text-lg flex-shrink-0">
              {(saved.name || currentUser?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-base leading-tight truncate">{saved.name || currentUser?.name}</p>
              {imc && <p className="text-[#D4AF37]/60 text-xs">IMC: {imc}</p>}
            </div>
          </div>

          {/* Chips 2×2 */}
          {(saved.weight || saved.height || saved.age) && (
            <div className="grid grid-cols-2 gap-3 p-4 border-b border-[#D4AF37]/15">
              {[
                { emoji: '⚖', value: saved.weight || '—', unit: 'KG' },
                { emoji: '📏', value: saved.height || '—', unit: 'CM' },
                { emoji: '🎂', value: saved.age || '—',    unit: 'ANOS' },
                { emoji: '📊', value: imc || '—',          unit: imc ? imcLabel(imc).toUpperCase() : 'IMC' },
              ].map(chip => (
                <div key={chip.unit} className="bg-[#0a0800] border border-[#D4AF37]/20 rounded-2xl p-4 flex flex-col items-center gap-1">
                  <span className="text-2xl">{chip.emoji}</span>
                  <span className="text-[#D4AF37] font-black text-2xl leading-tight">{chip.value}</span>
                  <span className="text-gray-500 text-[10px] uppercase tracking-widest">{chip.unit}</span>
                </div>
              ))}

              {/* Card de quilos a perder — ocupa as 2 colunas */}
              {imc && imc > 25 && saved.weight && saved.height && (() => {
                const pesoIdeal = 22 * Math.pow(parseFloat(saved.height) / 100, 2);
                const perder = (parseFloat(saved.weight) - pesoIdeal).toFixed(1);
                return (
                  <div className="col-span-2 relative rounded-2xl overflow-hidden p-[2px]">
                    <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] conic-glow" />
                    <div className="relative bg-[#0a0800] rounded-[14px] px-5 py-4 text-center">
                      <p className="text-gray-400 text-xs font-medium leading-relaxed">
                        De acordo com sua altura, idade e peso, você precisa perder{' '}
                        <span className="text-[#D4AF37] font-black text-sm">{perder} kg</span>
                        {' '}para atingir o peso ideal.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Lista com ícones */}
          <div className="divide-y divide-[#D4AF37]/8">
            {rows.map(row => (
              <div key={row.field} className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 flex-shrink-0">{row.icon}</div>
                <span className="w-24 flex-shrink-0 text-[10px] text-gray-500 uppercase tracking-widest">{row.label}</span>
                <div className="flex-1 min-w-0 text-right">
                  {editing ? (
                    (row as any).options ? (
                      <select
                        value={draft[row.field as keyof typeof draft]}
                        onChange={e => u(row.field, e.target.value)}
                        className="bg-black border border-[#D4AF37]/30 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#D4AF37] w-full"
                      >
                        <option value="">Selecionar...</option>
                        {Object.entries((row as any).options).map(([k, v]: any) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    ) : (
                      <input
                        type={(row as any).type || 'text'}
                        value={draft[row.field as keyof typeof draft]}
                        onChange={e => u(row.field, e.target.value)}
                        className="bg-black border border-[#D4AF37]/30 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#D4AF37] w-full text-right"
                      />
                    )
                  ) : (
                    <span className="text-white font-bold text-sm truncate block">{row.value || '—'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

// ─── Modal de Indicação ───────────────────────────────────────────────────────
const PROHIBITIONS = [
  { q: 'Posso comprar usando meu próprio link?', a: 'Não. Auto-indicações são proibidas e resultarão no cancelamento imediato da sua conta de revendedor e perda de todas as comissões.' },
  { q: 'Posso usar spam ou mensagens em massa?', a: 'Proibido. Qualquer forma de spam, disparos em massa ou grupos sem permissão resulta em banimento imediato.' },
  { q: 'Posso criar páginas ou sites falsos?', a: 'Absolutamente não. Criar páginas que se passem pelo Dieta Milenar sem autorização é crime sujeito a ação legal.' },
  { q: 'Posso prometer resultados garantidos?', a: 'Não. Prometer resultados além do que o programa garante oficialmente é proibido e gera responsabilidade legal.' },
  { q: 'Posso compartilhar o conteúdo do programa?', a: 'Jamais. Compartilhar e-books ou materiais do programa é pirataria e viola os direitos autorais.' },
  { q: 'Quando recebo minha comissão?', a: '50% de cada venda indicada. Liberado em até 7 dias úteis após confirmação do pagamento.' },
];

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  requestStatus: 'none' | 'pending' | 'approved' | 'rejected';
  onRequestSent: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, currentUser, requestStatus, onRequestSent }) => {
  const [agreed, setAgreed] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const token = localStorage.getItem('auth_token') || '';
  const referralLink = currentUser?.referralCode ? `${window.location.origin}/?ref=${currentUser.referralCode}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!agreed || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reseller-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phone: '' }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Erro ao enviar solicitação'); return; }
      toast.success('Solicitação enviada! Aguarde a aprovação.');
      onRequestSent();
      onClose();
    } catch { toast.error('Erro ao enviar solicitação'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[92vh] bg-[#0a0800] border border-[#D4AF37]/30 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.15)]">

        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
              <Share2 size={16} className="text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-white font-black text-sm">Programa de Indicação</p>
              <p className="text-[#D4AF37]/60 text-[10px] uppercase tracking-widest">Dieta Milenar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {requestStatus === 'approved' && referralLink ? (
            <div className="p-5 space-y-4">
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-white font-black text-lg">Você é um Revendedor Oficial!</p>
                <p className="text-gray-400 text-sm mt-1">Compartilhe seu link exclusivo e ganhe 50% de cada venda.</p>
              </div>
              <div className="bg-black/60 border border-[#D4AF37]/30 rounded-xl p-4">
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest mb-2">Seu link de indicação</p>
                <p className="text-white text-xs font-mono break-all mb-3">{referralLink}</p>
                <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-black font-bold py-2.5 rounded-lg text-sm hover:bg-[#b5952f] transition-colors">
                  <Copy size={14} /> {copied ? '✓ Copiado!' : 'Copiar Link'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[{ emoji: '💰', label: '50%', sub: 'de comissão' }, { emoji: '⚡', label: '7 dias', sub: 'para receber' }, { emoji: '♾', label: 'Ilimitado', sub: 'de indicações' }].map(i => (
                  <div key={i.label} className="bg-black/40 border border-gray-800 rounded-xl p-3">
                    <p className="text-xl mb-1">{i.emoji}</p>
                    <p className="text-[#D4AF37] font-black text-sm">{i.label}</p>
                    <p className="text-gray-600 text-[10px]">{i.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : requestStatus === 'pending' ? (
            <div className="p-5 text-center py-12">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-white font-black text-lg">Solicitação em Análise</p>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">Nossa equipe está avaliando seu perfil.<br />Você receberá uma notificação quando houver resposta.</p>
            </div>
          ) : requestStatus === 'rejected' ? (
            <div className="p-5 text-center py-12">
              <div className="text-4xl mb-3">❌</div>
              <p className="text-white font-black text-lg">Solicitação Não Aprovada</p>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">Sua solicitação não foi aprovada desta vez.<br />Entre em contato com o suporte para mais informações.</p>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Proposta de valor */}
              <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-2xl p-4">
                <p className="text-[#D4AF37] font-black text-base mb-2 flex items-center gap-2"><TrendingUp size={18} /> Transforme indicações em renda real</p>
                <p className="text-gray-300 text-sm leading-relaxed">O Programa de Revendedores do <span className="text-[#D4AF37] font-bold">Dieta Milenar</span> permite que você ganhe <span className="text-[#D4AF37] font-black">50% de comissão</span> em cada venda realizada através do seu link exclusivo — sem limite de ganhos.</p>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[{ icon: <Gift size={14} />, label: '50%', sub: 'Comissão' }, { icon: <Star size={14} />, label: 'Link Próprio', sub: 'Exclusivo' }, { icon: <TrendingUp size={14} />, label: 'Ilimitado', sub: 'Ganhos' }].map(i => (
                    <div key={i.label} className="bg-black/40 rounded-xl p-2.5 text-center">
                      <div className="text-[#D4AF37] flex justify-center mb-1">{i.icon}</div>
                      <p className="text-white font-black text-sm">{i.label}</p>
                      <p className="text-gray-500 text-[10px]">{i.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Como funciona */}
              <div>
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Shield size={14} className="text-[#D4AF37]" /> Como funciona</p>
                {[
                  { n: '1', t: 'Solicite sua aprovação', d: 'Envie sua solicitação e aguarde nossa análise em até 48h.' },
                  { n: '2', t: 'Receba seu link exclusivo', d: 'Após aprovado, seu link personalizado é gerado automaticamente.' },
                  { n: '3', t: 'Compartilhe e ganhe', d: 'A cada venda pelo seu link, 50% cai diretamente na sua carteira.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-black text-xs flex-shrink-0 mt-0.5">{s.n}</div>
                    <div><p className="text-white text-xs font-bold">{s.t}</p><p className="text-gray-500 text-xs">{s.d}</p></div>
                  </div>
                ))}
              </div>

              {/* FAQ proibições */}
              <div>
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><AlertTriangle size={14} className="text-yellow-400" /> Regras e Proibições</p>
                <div className="space-y-1">
                  {PROHIBITIONS.map((item, i) => (
                    <div key={i} className="border border-gray-800 rounded-xl overflow-hidden">
                      <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-900/50 transition-colors">
                        <span className="text-xs text-white font-medium pr-2">{item.q}</span>
                        <ChevronDown size={14} className={`text-gray-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === i && (
                        <div className="px-3 pb-3 text-xs text-gray-400 leading-relaxed border-t border-gray-800 pt-2">{item.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkbox */}
              <button onClick={() => setAgreed(!agreed)}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-gray-800 hover:border-[#D4AF37]/30 transition-colors text-left">
                <div className={`flex-shrink-0 mt-0.5 transition-colors ${agreed ? 'text-[#D4AF37]' : 'text-gray-600'}`}>
                  {agreed ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Estou de acordo e me comprometo a <span className="text-white font-bold">não violar o sistema</span> de indicações. Entendo que infrações resultarão no cancelamento imediato da conta de revendedor.
                </p>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {requestStatus === 'none' && (
          <div className="flex-shrink-0 p-4 border-t border-[#D4AF37]/15">
            <button onClick={handleSubmit} disabled={!agreed || loading}
              className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${agreed && !loading ? 'bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-[#b5952f]' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock content for the reader
const MOCK_CONTENT = `
  <h2>Bem-vindo aos Segredos do Egito</h2>
  <p>Neste módulo, você descobrirá os fundamentos da alimentação que manteve uma civilização inteira forte e saudável por milênios.</p>
  <p>Os antigos egípcios não contavam calorias. Eles nutriam o corpo com o que a terra oferecia de melhor.</p>
  <h3>O que você vai aprender:</h3>
  <ul>
    <li>Os 3 pilares da alimentação faraônica</li>
    <li>Como ativar seu metabolismo natural</li>
    <li>Receitas sagradas para o dia a dia</li>
  </ul>
`;

interface CoursePlayerProps {
  product: Product;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ product, onBack }) => {
  const { currentUser } = useData();
  const [activeModuleId, setActiveModuleId] = useState<string>(product.modules[0]?.id || '');
  const [activeChapterId, setActiveChapterId] = useState<string>(product.modules[0]?.chapters[0]?.id || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<string>('');

  // Find current active data
  const activeModule = product.modules.find(m => m.id === activeModuleId);
  const activeChapter = activeModule?.chapters.find(c => c.id === activeChapterId);

  // Mock progress tracking
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);

  const toggleChapterCompletion = (chapterId: string) => {
    setCompletedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const totalChapters = product.modules.reduce((acc, m) => acc + m.chapters.length, 0);
  const progress = Math.round((completedChapters.length / (totalChapters || 1)) * 100);

  const generateCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Background
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    doc.rect(12, 12, 273, 186);

    // Content
    doc.setTextColor(212, 175, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.text("CERTIFICADO DE CONCLUSÃO", 148.5, 50, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Certificamos que", 148.5, 80, { align: "center" });

    doc.setFontSize(30);
    doc.setFont("times", "bold");
    doc.text(currentUser?.name || "Aluno", 148.5, 100, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("concluiu com êxito o treinamento", 148.5, 120, { align: "center" });

    doc.setTextColor(212, 175, 55);
    doc.setFontSize(24);
    doc.text(product.name.toUpperCase(), 148.5, 135, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 148.5, 160, { align: "center" });

    // Signature Line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(98.5, 180, 198.5, 180);
    doc.text("Diretoria Dieta Milenar", 148.5, 185, { align: "center" });

    doc.save("certificado-dieta-milenar.pdf");
  };

  return (
    <div className="flex h-screen bg-black text-gray-300 overflow-hidden pt-16">
      <DashboardHeader title={product.name} icon={<BookOpen className="text-[#D4AF37]" />} />

      {/* Sidebar */}
      <motion.div 
        initial={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-gray-900 border-r border-gray-800 flex-shrink-0 flex flex-col h-full overflow-hidden absolute lg:relative z-20"
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between lg:hidden">
          <h3 className="font-heading font-bold text-[#D4AF37] truncate">Menu</h3>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400">
            <ChevronLeft />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {product.modules.map(module => (
            <div key={module.id}>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{module.title}</h4>
              <div className="space-y-1">
                {module.chapters.map(chapter => {
                  const isActive = chapter.id === activeChapterId;
                  const isCompleted = completedChapters.includes(chapter.id);
                  const isLocked = chapter.isLocked;

                  return (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        if (!isLocked) {
                          setActiveChapterId(chapter.id);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }
                      }}
                      disabled={isLocked}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all ${
                        isActive 
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' 
                          : 'hover:bg-gray-800 text-gray-400'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLocked ? (
                        <Lock size={14} />
                      ) : isCompleted ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${isActive ? 'border-[#D4AF37]' : 'border-gray-600'}`} />
                      )}
                      <span className="truncate text-left">{chapter.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mb-3">
            {completedChapters.length} de {totalChapters} aulas concluídas
          </p>
          
          {progress === 100 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                if (currentUser?.role === 'MEMBRO' || currentUser?.role === 'VISITANTE') {
                  toast.error('O download do certificado é exclusivo para membros VIP e superiores.');
                  return;
                }
                generateCertificate();
              }}
              className={`w-full flex items-center justify-center gap-2 border py-2 rounded-lg text-xs font-bold transition-all ${
                (currentUser?.role === 'MEMBRO' || currentUser?.role === 'VISITANTE')
                  ? 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
              }`}
            >
              <Award size={14} />
              {currentUser?.role === 'MEMBRO' || currentUser?.role === 'VISITANTE' ? 'CERTIFICADO BLOQUEADO' : 'BAIXAR CERTIFICADO'}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        {/* Top Bar */}
        <div className="h-14 bg-black border-b border-gray-800 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-bold text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">{activeChapter?.title}</h2>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-lg transition-colors ${showNotes ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-400 hover:text-white'}`}
              title="Anotações"
            >
              <StickyNote size={20} />
            </button>
            <button 
              onClick={onBack}
              className="text-xs sm:text-sm text-gray-400 hover:text-white whitespace-nowrap"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-12">
            <div className="max-w-3xl mx-auto pb-20">
              {activeChapter ? (
                <motion.div
                  key={activeChapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="aspect-video bg-gray-900 rounded-xl mb-8 flex flex-col items-center justify-center border border-gray-800 shadow-2xl relative overflow-hidden group">
                    {currentUser?.role === 'VISITANTE' ? (
                      <div className="text-center p-6">
                        <Lock className="text-[#D4AF37] w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-white font-bold mb-2">Vídeo Bloqueado</p>
                        <p className="text-xs text-gray-500 max-w-[200px]">Torne-se um Membro para desbloquear este conteúdo sagrado.</p>
                      </div>
                    ) : (
                      <>
                        <Play className="text-gray-700 w-16 h-16" />
                        <span className="sr-only">Video Placeholder</span>
                      </>
                    )}
                  </div>

                  <div className="prose prose-invert prose-gold max-w-none relative">
                    {currentUser?.role === 'VISITANTE' && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black z-10 flex items-end justify-center pb-10">
                        <div className="bg-gray-900 border border-[#D4AF37]/30 p-6 rounded-2xl text-center shadow-2xl max-w-sm mx-4">
                          <Lock className="text-[#D4AF37] mx-auto mb-3" size={24} />
                          <h4 className="text-white font-bold mb-2">Conteúdo Restrito</h4>
                          <p className="text-sm text-gray-400 mb-4">Visitantes podem navegar pelo painel, mas o acesso completo aos rituais e e-books é exclusivo para membros.</p>
                          <button 
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded-lg text-sm hover:bg-[#b5952f] transition-colors"
                          >
                            Quero ser Membro
                          </button>
                        </div>
                      </div>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-heading text-[#D4AF37] mb-6">{activeChapter.title}</h1>
                    <div className={`${currentUser?.role === 'VISITANTE' ? 'blur-sm select-none pointer-events-none' : ''}`} dangerouslySetInnerHTML={{ __html: activeChapter.content || MOCK_CONTENT }} />
                  </div>

                  {/* Navigation & Completion */}
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-800 pt-8">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors order-2 sm:order-1">
                      <ChevronLeft size={20} />
                      Aula Anterior
                    </button>

                    <button 
                      onClick={() => activeChapter && toggleChapterCompletion(activeChapter.id)}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all order-1 sm:order-2 ${
                        activeChapter && completedChapters.includes(activeChapter.id)
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-[#D4AF37] text-black hover:bg-[#b5952f]'
                      }`}
                    >
                      {activeChapter && completedChapters.includes(activeChapter.id) ? (
                        <>
                          <CheckCircle size={20} />
                          Concluída
                        </>
                      ) : (
                        'Marcar como Concluída'
                      )}
                    </button>

                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors order-3">
                      Próxima Aula
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500">Selecione uma aula para começar.</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Sidebar */}
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-gray-900 border-l border-gray-800 flex-shrink-0 flex flex-col h-full overflow-hidden hidden lg:flex"
              >
                <div className="p-4 border-b border-gray-800">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <StickyNote size={18} className="text-[#D4AF37]" />
                    Minhas Anotações
                  </h3>
                </div>
                <div className="flex-1 p-4">
                  <textarea
                    className="w-full h-full bg-black/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37] resize-none"
                    placeholder="Digite suas anotações sobre esta aula aqui..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="p-4 border-t border-gray-800">
                  <button className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded hover:bg-[#b5952f] transition-colors">
                    Salvar Nota
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

type StudentTab = 'library' | 'history' | 'bonuses' | 'support' | 'products';

export const StudentDashboard: React.FC = () => {
  const { products, currentUser, transactions, bonuses, globalSettings, categories, subcategories, ebooks, bonusCategories, bonusItems, logout, isFullAccessMode } = useData();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<StudentTab>('library');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [productToBuy, setProductToBuy] = useState<Product | null>(null);
  const [isProductCheckoutOpen, setIsProductCheckoutOpen] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any | null>(null);
  const [selectedBonusCategory, setSelectedBonusCategory] = useState<BonusCategory | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [rejectedProof, setRejectedProof] = useState<{reason: string} | null>(null);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [congratsNotif, setCongratsNotif] = useState<{message: string} | null>(null);
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'REVENDA') { setRequestStatus('approved'); return; }
    const token = localStorage.getItem('auth_token') || '';
    fetch('/api/reseller-requests', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: any) => {
        if (data && data.status) setRequestStatus(data.status as any);
        else setRequestStatus('none');
      })
      .catch(() => setRequestStatus('none'));
  }, [currentUser]);

  // Verifica notificações de rejeição e congratulação
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem('auth_token') || '';
    fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        if (currentUser.role === 'VISITANTE') {
          const rejection = data.find(n => n.type === 'rejection' && !n.is_read);
          if (rejection) {
            setRejectedProof({ reason: rejection.message });
            setShowRejectedModal(true);
          }
        }
        const congrats = data.find(n => n.type === 'system' && !n.is_read && n.message?.includes('Bem-vindo à Ordem'));
        if (congrats) {
          setCongratsNotif({ message: congrats.message });
          setShowCongratsModal(true);
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const menuItems = [
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
    { id: 'bonuses', label: 'Bônus', icon: Download },
    { id: 'products', label: 'Produtos', icon: Box },
    { id: 'history', label: 'Histórico', icon: Clock },
    { id: 'support', label: 'Suporte', icon: MessageCircle },
  ] as const;

  // Filter products owned by user (Mock: All products for now)
  const myProducts = products;
  
  // Filter transactions for current user
  const myTransactions = transactions.filter(t => t.userId === currentUser?.id);

  // Filter bonuses for current user role based on hierarchy
  const myBonuses = bonuses.filter(b => {
    if (!b.active) return false;
    
    const roleHierarchy = {
      'VISITANTE': 0,
      'MEMBRO': 1,
      'VIP': 2,
      'REVENDA': 3,
      'ADMIN': 4
    };

    const userLevel = roleHierarchy[currentUser?.role || 'VISITANTE'];
    const targetLevel = roleHierarchy[b.targetAudience as UserRole] || 1;

    return userLevel >= targetLevel;
  });

  // Check if a category is unlocked for the user
  const isCategoryUnlocked = (category: Category) => {
    if (isFullAccessMode) return true;
    if (currentUser?.role === 'ADMIN') return true;
    if (currentUser?.role === 'VISITANTE') return false;

    const joinDate = currentUser?.createdAt ? new Date(currentUser.createdAt) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const requiredDays = category.dripDays || 0;
    return diffDays >= requiredDays;
  };

  const handleDismissRejection = async () => {
    const token = localStorage.getItem('auth_token') || '';
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'rejection' }),
      });
    } catch {}
    setShowRejectedModal(false);
    setRejectedProof(null);
  };

  const handleDismissCongrats = async () => {
    const token = localStorage.getItem('auth_token') || '';
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'system' }),
      });
    } catch {}
    setShowCongratsModal(false);
    setCongratsNotif(null);
  };

  const handlePaymentSuccess = () => {
    toast.success('Pagamento realizado com sucesso! O acesso será liberado em instantes.');
    // Here you would update the user's access in the context
    // addTransaction({ ... });
  };

  const renderLibrary = () => {
    // ── Nível 3: E-books da subcategoria selecionada ──────────────────────
    if (selectedCategory && selectedSubcategory) {
      const subEbooks = ebooks
        .filter(e => e.subcategoryId === selectedSubcategory.id)
        .sort((a, b) => a.order - b.order);

      return (
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/20">
              <BookOpen className="text-[#D4AF37]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">{selectedSubcategory.name}</h2>
              <p className="text-gray-400 text-sm line-clamp-1">{selectedSubcategory.description}</p>
            </div>
          </div>

          {subEbooks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
              Nenhum e-book disponível nesta subcategoria.
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl">
              <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}>
                {subEbooks.map(ebook => (
                  <motion.div
                    key={ebook.id}
                    whileHover={{ y: -5 }}
                    className={`flex-none w-full snap-start bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg group cursor-pointer ${currentUser?.role === 'VISITANTE' ? 'opacity-75' : ''}`}
                    style={{ scrollSnapStop: 'always' }}
                    onClick={() => {
                      if (currentUser?.role === 'VISITANTE') {
                        const first = products.find(p => p.active);
                        if (first) { setProductToBuy(first); setIsProductCheckoutOpen(true); }
                        return;
                      }
                      setSelectedEbook(ebook);
                      setIsEbookModalOpen(true);
                    }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img src={ebook.coverImage || '/img/capa.png'} alt={ebook.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-[#D4AF37] text-black p-3 rounded-full"><BookOpen size={24} /></div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-white mb-1 font-heading line-clamp-1">{ebook.title}</h3>
                      <p className="text-[10px] text-gray-400 line-clamp-2">{ebook.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {subEbooks.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-2 opacity-40">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-800" />
                  <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Deslize para o lado</p>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-800" />
                </div>
              )}
            </div>
          )}

          <button onClick={() => setSelectedSubcategory(null)} className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors mt-6 text-sm">
            <ChevronLeft size={16} /> Voltar para {selectedCategory.name}
          </button>
        </div>
      );
    }

    // ── Nível 2: Subcategorias da categoria selecionada ───────────────────
    if (selectedCategory) {
      const catSubcategories = subcategories
        .filter(s => s.categoryId === selectedCategory.id && s.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      return (
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/20">
              <Layers className="text-[#D4AF37]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">{selectedCategory.name}</h2>
              <p className="text-gray-400 text-sm line-clamp-1">{selectedCategory.description}</p>
            </div>
          </div>

          {catSubcategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
              Nenhuma subcategoria disponível nesta categoria.
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl">
              <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}>
                {catSubcategories.map(sub => (
                  <motion.div
                    key={sub.id}
                    whileHover={{ y: -5 }}
                    className="flex-none w-full snap-start bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg group cursor-pointer hover:border-[#D4AF37]/30 transition-all"
                    style={{ scrollSnapStop: 'always' }}
                    onClick={() => setSelectedSubcategory(sub)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-black">
                      <img src={sub.coverImage || '/img/capa.png'} alt={sub.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={e => { (e.target as HTMLImageElement).src = '/img/capa.png'; }} />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-[#D4AF37] text-black p-3 rounded-full"><BookOpen size={24} /></div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-white mb-1 font-heading line-clamp-1">{sub.name}</h3>
                      <p className="text-[10px] text-gray-400 line-clamp-2">{sub.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {catSubcategories.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-2 opacity-40">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-800" />
                  <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Deslize para o lado</p>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-800" />
                </div>
              )}
            </div>
          )}

          <button onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }} className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors mt-6 text-sm">
            <ChevronLeft size={16} /> Voltar para Categorias
          </button>
        </div>
      );
    }

    // ── Nível 1: Lista de categorias ──────────────────────────────────────
    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/20">
            <Layers className="text-[#D4AF37]" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Categorias</h2>
            <p className="text-gray-400 text-sm">Escolha uma categoria para começar sua jornada.</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl">
            <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}>
              {categories.sort((a, b) => a.order - b.order).map(category => {
                const unlocked = isCategoryUnlocked(category);
                return (
                  <motion.div
                    key={category.id}
                    whileHover={unlocked ? { y: -5 } : {}}
                    className={`flex-none w-full snap-start bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg group transition-all ${unlocked ? 'cursor-pointer hover:border-[#D4AF37]/30' : 'opacity-75 cursor-not-allowed'}`}
                    style={{ scrollSnapStop: 'always' }}
                    onClick={() => unlocked && setSelectedCategory(category)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-black">
                      <img src={category.coverImage || '/img/capa.png'} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={e => { (e.target as HTMLImageElement).src = '/img/capa.png'; }} />
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                          <Lock size={24} className="text-[#D4AF37]" />
                          <span className="text-xs text-white font-bold text-center px-3">Conteúdo Bloqueado</span>
                          {currentUser?.role === 'VISITANTE' && (
                            <span className="text-[10px] text-[#D4AF37] font-semibold text-center px-3">Disponível para Alunos</span>
                          )}
                          {currentUser?.role !== 'VISITANTE' && category.dripDays > 0 && (
                            <span className="text-[10px] text-gray-400 text-center px-3">Libera em {category.dripDays} dias</span>
                          )}
                        </div>
                      )}
                      {unlocked && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-[#D4AF37] text-black p-3 rounded-full">
                            <BookOpen size={24} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className={`text-sm font-bold mb-1 font-heading line-clamp-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>{category.name}</h3>
                      <p className="text-[10px] text-gray-400 line-clamp-2">{category.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {categories.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-2 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-800" />
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Deslize para o lado</p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-800" />
              </div>
            )}
          </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-black/50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Produto</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {myTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Nenhuma compra encontrada.</td>
              </tr>
            ) : (
              myTransactions.map(t => (
                <tr key={t.id} className="text-sm hover:bg-gray-800/50">
                  <td className="p-4 text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-4 text-white font-medium">{t.planName}</td>
                  <td className="p-4 text-[#D4AF37]">R$ {t.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                      t.status === 'approved' ? 'bg-green-900/20 text-green-400' :
                      t.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {t.status === 'approved' ? 'Aprovado' : t.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Check if a bonus category is unlocked for the user
  const isBonusCategoryUnlocked = (category: BonusCategory) => {
    if (isFullAccessMode) return true;
    if (currentUser?.role === 'ADMIN') return true;
    if (currentUser?.role === 'VISITANTE') return false;
    const joinDate = currentUser?.createdAt ? new Date(currentUser.createdAt) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const requiredDays = category.dripDays || 0;
    return diffDays >= requiredDays;
  };

  const renderBonuses = () => {
    // Vista interna: itens de uma categoria de bônus selecionada
    if (selectedBonusCategory) {
      const categoryBonusItems = bonusItems
        .filter(bi => bi.bonusCategoryId === selectedBonusCategory.id)
        .sort((a, b) => a.order - b.order);

      return (
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/20">
              <Download className="text-[#D4AF37]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">{selectedBonusCategory.name}</h2>
              <p className="text-gray-400 text-sm line-clamp-1">{selectedBonusCategory.description}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl">
            <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}>
              {categoryBonusItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500 w-full">
                  Nenhum bônus disponível nesta categoria.
                </div>
              ) : (
                categoryBonusItems.map(item => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className={`flex-none w-full snap-start bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg group cursor-pointer ${currentUser?.role === 'VISITANTE' ? 'opacity-75' : ''}`}
                    style={{ scrollSnapStop: 'always' }}
                    onClick={() => {
                      if (currentUser?.role === 'VISITANTE') {
                        const first = products.find(p => p.active);
                        if (first) { setProductToBuy(first); setIsProductCheckoutOpen(true); }
                        return;
                      }
                      setSelectedEbook({ ...item, categoryId: item.bonusCategoryId } as any);
                      setIsEbookModalOpen(true);
                    }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={item.coverImage || '/img/capa.png'}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-[#D4AF37] text-black p-3 rounded-full">
                          <BookOpen size={24} />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-white mb-1 font-heading line-clamp-1">{item.title}</h3>
                      <p className="text-[10px] text-gray-400 line-clamp-2">{item.description}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            {categoryBonusItems.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-2 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-800" />
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Deslize para o lado</p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-800" />
              </div>
            )}
          </div>

          <button
            onClick={() => setSelectedBonusCategory(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors mt-6 text-sm"
          >
            <ChevronLeft size={16} /> Voltar para Bônus
          </button>
        </div>
      );
    }

    // Vista de categorias de bônus
    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/20">
            <Download className="text-[#D4AF37]" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Bônus</h2>
            <p className="text-gray-400 text-sm">Seus materiais e bônus exclusivos.</p>
          </div>
        </div>

        {bonusCategories.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
            Nenhum bônus disponível no momento.
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl">
            <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}>
              {bonusCategories.sort((a, b) => a.order - b.order).map(category => {
                const unlocked = isBonusCategoryUnlocked(category);
                return (
                  <motion.div
                    key={category.id}
                    whileHover={unlocked ? { y: -5 } : {}}
                    className={`flex-none w-full snap-start bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg group transition-all ${unlocked ? 'cursor-pointer hover:border-[#D4AF37]/30' : 'opacity-75 cursor-not-allowed'}`}
                    style={{ scrollSnapStop: 'always' }}
                    onClick={() => unlocked && setSelectedBonusCategory(category)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-black">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className={`p-5 rounded-2xl ${unlocked ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-gray-800 text-gray-500'}`}>
                          {unlocked ? <Download size={40} /> : <Lock size={40} />}
                        </div>
                      </div>
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                          <Lock size={24} className="text-[#D4AF37]" />
                          <span className="text-xs text-white font-bold text-center px-3">Conteúdo Bloqueado</span>
                          {currentUser?.role === 'VISITANTE' && (
                            <span className="text-[10px] text-[#D4AF37] font-semibold text-center px-3">Disponível para Alunos</span>
                          )}
                          {currentUser?.role !== 'VISITANTE' && category.dripDays > 0 && (
                            <span className="text-[10px] text-gray-400 text-center px-3">Libera em {category.dripDays} dias</span>
                          )}
                        </div>
                      )}
                      {unlocked && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-[#D4AF37] text-black p-3 rounded-full">
                            <BookOpen size={24} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className={`text-sm font-bold mb-1 font-heading line-clamp-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>{category.name}</h3>
                      <p className="text-[10px] text-gray-400 line-clamp-2">{category.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {bonusCategories.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-2 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-800" />
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Deslize para o lado</p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-800" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProducts = () => (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Produtos</h2>
        <p className="text-gray-400">Adquira ou acesse seus produtos.</p>
      </div>
      {myProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
          Nenhum produto disponível no momento.
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl">
          <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}>
            {myProducts.map(product => (
              <div
                key={product.id}
                className="flex-none w-full snap-start bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group hover:border-[#D4AF37]/30 transition-all flex flex-col"
                style={{ scrollSnapStop: 'always' }}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={product.coverImage || '/img/capa.png'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-[#D4AF37] text-black p-3 rounded-full">
                      <Play size={24} />
                    </div>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-white font-bold mb-1">{product.name}</h3>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-4">{product.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="text-[#D4AF37] font-bold text-sm">
                      R$ {(+product.price).toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedProduct(product); }}
                        className="flex items-center gap-1.5 text-xs bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors font-bold"
                      >
                        <Play size={13} /> Acessar
                      </button>
                      <button
                        onClick={() => { setProductToBuy(product); setIsProductCheckoutOpen(true); }}
                        className="flex items-center gap-1.5 text-xs bg-[#D4AF37] text-black px-3 py-2 rounded-lg hover:bg-[#b5952f] transition-colors font-bold"
                      >
                        <Download size={13} /> Comprar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {myProducts.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-2 opacity-40">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-800" />
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Deslize para o lado</p>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-800" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <SupportTickets isAdmin={false} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <button
          onClick={() => window.open(`https://wa.me/${globalSettings.supportWhatsapp}`, '_blank')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <MessageCircle size={18} /> WhatsApp
        </button>
        <button
          onClick={() => window.location.href = `mailto:${globalSettings.supportEmail}`}
          className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <FileText size={18} /> E-mail
        </button>
      </div>
    </div>
  );

  if (showProfile) {
    return <MemberProfile onBack={() => setShowProfile(false)} currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Modal: Pagamento Rejeitado */}
      {showRejectedModal && rejectedProof && (
        <div className="fixed inset-0 bg-black/90 z-[90] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg">Pagamento Recusado</h3>
            <p className="text-gray-400 text-sm">Seu comprovante foi analisado e não foi aprovado.</p>
            <div className="bg-black rounded-xl border border-red-500/20 p-4 text-left">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Motivo</p>
              <p className="text-red-300 text-sm">{rejectedProof.reason.replace('Seu comprovante de pagamento foi recusado. Motivo: ', '')}</p>
            </div>
            <p className="text-gray-500 text-xs">Entre em contato com o suporte ou realize um novo pagamento.</p>
            <button
              onClick={handleDismissRejection}
              className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl text-sm hover:bg-[#b5952f] transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      {/* Modal: Bem-vindo / Acesso Aprovado */}
      {showCongratsModal && congratsNotif && (
        <div className="fixed inset-0 bg-black/95 z-[90] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-yellow-500/40 rounded-2xl w-full max-w-sm p-6 space-y-5 text-center shadow-2xl shadow-yellow-900/20">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto border border-yellow-500/30">
              <span className="text-3xl">🏆</span>
            </div>
            <div>
              <h3 className="text-white font-black text-xl">Acesso Aprovado!</h3>
              <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mt-1">Ordem dos Iniciados</p>
            </div>
            <div className="bg-black rounded-xl border border-yellow-500/20 p-4 text-left space-y-3 max-h-64 overflow-y-auto">
              {congratsNotif.message.split('\n').map((line: string, i: number) => (
                line.trim() === '' ? <div key={i} className="h-1" /> :
                line.startsWith('✨') || line.startsWith('🏆') || line.startsWith('🌟') ? (
                  <p key={i} className="text-yellow-400 font-bold text-sm">{line}</p>
                ) : line.startsWith('•') ? (
                  <p key={i} className="text-gray-300 text-xs pl-2">{line}</p>
                ) : (
                  <p key={i} className="text-gray-300 text-sm leading-relaxed">{line}</p>
                )
              ))}
            </div>
            <button
              onClick={handleDismissCongrats}
              className="w-full bg-[#D4AF37] text-black font-black py-3 rounded-xl text-sm hover:bg-[#b5952f] transition-colors tracking-wide"
            >
              Começar Minha Jornada ✨
            </button>
          </div>
        </div>
      )}

      <div className="pt-16 px-4 pb-12 max-w-7xl mx-auto">
        {/* Fixed Tab Bar Navigation */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-gray-800 flex items-center overflow-hidden">
          {/* Fixed Hamburger Menu */}
          <div className="relative z-50 bg-black py-3 pr-4 flex items-center border-r border-gray-800/50 shadow-[20px_0_25px_-10px_rgba(0,0,0,0.9)]">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg text-[#D4AF37] transition-colors flex items-center justify-center"
            >
              <Menu size={24} />
            </button>

            {/* Drawer lateral igual ao admin */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 left-0 bottom-0 w-80 bg-gray-900 border-r border-gray-800 z-[60] flex flex-col shadow-2xl"
                  >
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                      <span className="font-heading font-bold text-[#D4AF37] text-xl">Menu</span>
                      <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      {/* User Info */}
                      <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-white font-bold truncate">{currentUser?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                {currentUser?.role === 'VIP' ? 'MEMBRO VIP' : currentUser?.role}
                              </span>
                              <button
                                onClick={() => { setShowReferral(true); setIsMenuOpen(false); }}
                                className="text-[10px] bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-0.5 rounded font-bold hover:bg-[#D4AF37]/20 transition-colors flex items-center gap-1"
                              >
                                <Share2 size={10} />
                                {requestStatus === 'approved'
                                  ? '🔗 Meu Link'
                                  : requestStatus === 'pending'
                                  ? '⏳ Pendente'
                                  : '💰 Indicar 50%'}
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => { setShowProfile(true); setIsMenuOpen(false); }}
                            className="flex-shrink-0 p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
                            title="Editar Perfil"
                          >
                            <Edit2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Tabs de navegação */}
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 px-2">Navegação</p>
                        <button
                          onClick={() => { window.location.href = '/?home=true'; }}
                          className="flex items-center gap-3 w-full p-3 rounded-lg text-sm font-bold transition-all text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          <Home size={16} />
                          Início
                        </button>
                        {menuItems.map(item => (
                          <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-bold transition-all ${activeTab === item.id ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                          >
                            <item.icon size={16} />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-800">
                      <button
                        onClick={() => { logout(); window.location.href = '/'; }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-900/20 text-red-500 hover:bg-red-900/30 transition-colors font-bold justify-center"
                      >
                        <LogOut size={18} /> Sair
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Scrollable Tabs - Pass under the fixed hamburger */}
          <div className="flex overflow-x-auto scrollbar-hide gap-4 py-4 px-6 flex-1 whitespace-nowrap snap-x">
            {menuItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all snap-start border flex items-center gap-2 ${
                  activeTab === item.id 
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                    : 'text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white bg-gray-900/50'
                }`}
              >
                <item.icon size={14} className={activeTab === item.id ? 'text-black' : 'text-gray-500'} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'library' && renderLibrary()}
            {activeTab === 'bonuses' && renderBonuses()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'support' && renderSupport()}
          </motion.div>
        </AnimatePresence>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        productName={productToBuy?.name || ''}
        price={productToBuy?.price || 0}
        onSuccess={handlePaymentSuccess}
      />

      <ProductCheckoutModal
        isOpen={isProductCheckoutOpen}
        onClose={() => setIsProductCheckoutOpen(false)}
        product={productToBuy}
      />

      <EbookModal
        isOpen={isEbookModalOpen}
        onClose={() => setIsEbookModalOpen(false)}
        ebook={selectedEbook}
        userRole={currentUser?.role}
      />

      {/* Modal de Indicação */}
      <ReferralModal
        isOpen={showReferral}
        onClose={() => setShowReferral(false)}
        currentUser={currentUser}
        requestStatus={requestStatus}
        onRequestSent={() => setRequestStatus('pending')}
      />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${globalSettings.supportWhatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        title="Falar com Suporte"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
};
