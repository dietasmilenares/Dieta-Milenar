import React, { useState } from 'react';
import { Check, Edit2, X, Save, Mail, Phone, Target, Activity, AlertTriangle, Ruler, Weight, Calendar, Users, User } from 'lucide-react';

interface TestePageProps {
  onBack: () => void;
}

const MOCK_PROFILE = {
  name: 'João Membro',
  email: 'joao@email.com',
  phone: '(11) 99999-8888',
  gender: 'masculino',
  age: 34,
  weight: 82.5,
  height: 178,
  activity_level: 'moderado',
  goal: 'perda',
  restrictions: 'Intolerante à lactose',
};

const calcIMC = (w: number, h: number) => parseFloat((w / Math.pow(h / 100, 2)).toFixed(1));
const imcLabel = (imc: number) => imc < 18.5 ? 'Abaixo do peso' : imc < 25 ? 'Peso normal' : imc < 30 ? 'Sobrepeso' : 'Obesidade';

const GOAL_LABELS: Record<string, string> = { perda: 'Perda de Peso', ganho: 'Ganho de Massa', saude: 'Saúde e Longevidade', energia: 'Mais Energia' };
const ACTIVITY_LABELS: Record<string, string> = { sedentario: 'Sedentário', leve: 'Leve (1-2x/sem)', moderado: 'Moderado (3-4x/sem)', intenso: 'Intenso (5x+/sem)' };
const GENDER_LABELS: Record<string, string> = { masculino: 'Masculino', feminino: 'Feminino', outro: 'Outro' };

const HorusEye = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 26" fill="none">
    <path d="M2 13 C10 2 30 2 38 13 C30 24 10 24 2 13Z" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
    <circle cx="20" cy="13" r="5" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
    <circle cx="20" cy="13" r="2" fill="#D4AF37"/>
    <path d="M20 18 L17 24 L20 22 L23 24 Z" stroke="#D4AF37" strokeWidth="1" fill="none"/>
    <path d="M28 8 L34 4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M28 9 L36 8" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const ProfileTemplate = () => {
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState(MOCK_PROFILE);
  const [draft, setDraft] = useState(MOCK_PROFILE);
  const u = (f: string, v: any) => setDraft((p: any) => ({ ...p, [f]: v }));
  const startEdit = () => { setDraft(d); setEditing(true); };
  const save = () => { setD(draft); setEditing(false); };
  const cancel = () => setEditing(false);
  const profile = editing ? draft : d;
  const imc = calcIMC(profile.weight, profile.height);

  const rows = [
    { icon: <User size={18} className="text-[#D4AF37]" />,          label: 'NOME',       value: profile.name,                            field: 'name' },
    { icon: <Mail size={18} className="text-[#D4AF37]" />,          label: 'E-MAIL',     value: profile.email,                           field: 'email',          type: 'email' },
    { icon: <Phone size={18} className="text-[#D4AF37]" />,         label: 'WHATSAPP',   value: profile.phone,                           field: 'phone' },
    { icon: <Users size={18} className="text-[#D4AF37]" />,         label: 'GÊNERO',     value: GENDER_LABELS[profile.gender],           field: 'gender',         options: GENDER_LABELS },
    { icon: <Calendar size={18} className="text-[#D4AF37]" />,      label: 'IDADE',      value: `${profile.age} anos`,                   field: 'age',            type: 'number' },
    { icon: <Ruler size={18} className="text-[#D4AF37]" />,         label: 'ALTURA',     value: `${profile.height} cm`,                  field: 'height',         type: 'number' },
    { icon: <Weight size={18} className="text-[#D4AF37]" />,        label: 'PESO',       value: `${profile.weight} kg`,                  field: 'weight',         type: 'number' },
    { icon: <Target size={18} className="text-[#D4AF37]" />,        label: 'OBJETIVO',   value: GOAL_LABELS[profile.goal],               field: 'goal',           options: GOAL_LABELS },
    { icon: <Activity size={18} className="text-[#D4AF37]" />,      label: 'ATIVIDADE',  value: ACTIVITY_LABELS[profile.activity_level], field: 'activity_level', options: ACTIVITY_LABELS },
    { icon: <AlertTriangle size={18} className="text-[#D4AF37]" />, label: 'RESTRIÇÕES', value: profile.restrictions,                    field: 'restrictions' },
  ];

  return (
    <div className="bg-[#0d0b00] border border-[#D4AF37]/30 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-[#D4AF37]/15">
        <div className="w-11 h-11 rounded-full bg-[#D4AF37]/15 border-2 border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-black text-lg flex-shrink-0">
          {profile.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-base leading-tight truncate">{profile.name}</p>
          <p className="text-[#D4AF37]/60 text-xs">IMC: {imc}</p>
        </div>
        {editing ? (
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={save} className="flex items-center gap-1.5 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1.5 rounded-lg">
              <Save size={12} /> Salvar
            </button>
            <button onClick={cancel} className="p-1.5 bg-gray-800 text-gray-400 rounded-lg">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button onClick={startEdit} className="flex items-center gap-1.5 bg-[#1a1400] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0">
            <Edit2 size={12} /> Editar
          </button>
        )}
      </div>

      {/* Chips 2×2 */}
      <div className="grid grid-cols-2 gap-3 p-4 border-b border-[#D4AF37]/15">
        {[
          { emoji: '⚖', value: profile.weight, unit: 'KG' },
          { emoji: '📏', value: profile.height,  unit: 'CM' },
          { emoji: '🎂', value: profile.age,     unit: 'ANOS' },
          { emoji: '📊', value: imc,             unit: imcLabel(imc).toUpperCase() },
        ].map(chip => (
          <div key={chip.unit} className="bg-[#0a0800] border border-[#D4AF37]/20 rounded-2xl p-4 flex flex-col items-center gap-1">
            <span className="text-2xl">{chip.emoji}</span>
            <span className="text-[#D4AF37] font-black text-2xl leading-tight">{chip.value}</span>
            <span className="text-gray-500 text-[10px] uppercase tracking-widest">{chip.unit}</span>
          </div>
        ))}
      </div>

      {/* Lista com ícones inline */}
      <div className="divide-y divide-[#D4AF37]/8">
        {rows.map(row => (
          <div key={row.field} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 flex-shrink-0">{row.icon}</div>
            <span className="w-24 flex-shrink-0 text-[10px] text-gray-500 uppercase tracking-widest">{row.label}</span>
            <div className="flex-1 min-w-0 text-right">
              {editing ? (
                row.options ? (
                  <select
                    value={profile[row.field as keyof typeof profile] as string}
                    onChange={e => u(row.field, e.target.value)}
                    className="bg-black border border-[#D4AF37]/30 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#D4AF37] w-full"
                  >
                    {Object.entries(row.options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                ) : (
                  <input
                    type={row.type || 'text'}
                    value={profile[row.field as keyof typeof profile] as string}
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
  );
};

export const TestePage: React.FC<TestePageProps> = ({ onBack }) => {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <HorusEye size={24} />
          <div>
            <h1 className="text-2xl font-black text-white">Template <span className="text-[#D4AF37]">Perfil do Membro</span></h1>
            <p className="text-gray-500 text-sm mt-1">Clique em "Usar este" para confirmar.</p>
          </div>
        </div>
        <div className={`rounded-2xl border-2 transition-all ${selected === 1 ? 'border-[#D4AF37]' : 'border-gray-800'}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-white font-bold text-sm">Perfil do Membro</span>
            <button
              onClick={() => setSelected(selected === 1 ? null : 1)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${selected === 1 ? 'bg-[#D4AF37] text-black' : 'bg-gray-800 text-gray-300 hover:text-white'}`}
            >
              {selected === 1 ? <><Check size={12} /> Selecionado</> : 'Usar este'}
            </button>
          </div>
          <div className="p-4"><ProfileTemplate /></div>
        </div>
        {selected === 1 && (
          <div className="mt-6 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-center">
            <p className="text-[#D4AF37] font-bold">Template confirmado. Me avise para implementar como tela de perfil do membro.</p>
          </div>
        )}
      </div>
    </div>
  );
};
