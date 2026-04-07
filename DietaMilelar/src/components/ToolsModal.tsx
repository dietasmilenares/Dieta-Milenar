import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wrench, FileText, Users, Shield, User, Crown, Unlock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer shrink-0">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
    <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
  </label>
);

export const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose }) => {
  const {
    isGlobalNotesEnabled, setGlobalNotesEnabled,
    isMemberNotificationsEnabled, setMemberNotificationsEnabled,
    currentUser, setViewRole,
    isFullAccessMode, setFullAccessMode,
  } = useData();

  const perfis = [
    { role: 'ADMIN' as UserRole, label: 'Administrador', icon: <Shield size={13} /> },
    { role: 'REVENDA' as UserRole, label: 'Revenda', icon: <Users size={13} /> },
    { role: 'VIP' as UserRole, label: 'Membro VIP', icon: <Crown size={13} /> },
    { role: 'MEMBRO' as UserRole, label: 'Membro', icon: <User size={13} /> },
    { role: 'VISITANTE' as UserRole, label: 'Visitante', icon: <User size={13} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-gray-900 border border-[#D4AF37]/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-black/50 shrink-0">
              <h2 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                <Wrench size={14} />
                Ferramentas Administrativas
              </h2>
              <button onClick={onClose} className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 overflow-y-auto custom-scrollbar flex-1 space-y-3">

              {/* Alternar Perfil */}
              <div className="bg-black rounded-lg border border-gray-800 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-800">
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold">Alternar Perfil</p>
                </div>
                <div className="divide-y divide-gray-800/50">
                  {perfis.map(({ role, label, icon }) => {
                    const isActive = currentUser?.role === role && !isFullAccessMode;
                    return (
                      <button
                        key={role}
                        onClick={() => { setFullAccessMode(false); setViewRole(role); onClose(); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${isActive ? 'bg-[#D4AF37]/5' : 'hover:bg-gray-900'}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-gray-800 text-gray-500'}`}>
                          {icon}
                        </div>
                        <span className={`flex-1 text-xs font-bold ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`}>{label}</span>
                        {isActive && <span className="text-[9px] text-[#D4AF37] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border border-[#D4AF37]/30">Ativo</span>}
                      </button>
                    );
                  })}
                  {/* Tudo liberado */}
                  <button
                    onClick={() => { setFullAccessMode(true); setViewRole('VIP'); onClose(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${isFullAccessMode ? 'bg-green-500/10' : 'hover:bg-gray-900'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isFullAccessMode ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                      <Unlock size={13} />
                    </div>
                    <span className={`flex-1 text-xs font-bold ${isFullAccessMode ? 'text-green-400' : 'text-gray-400'}`}>Tudo liberado</span>
                    {isFullAccessMode && <span className="text-[9px] text-green-400 uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border border-green-500/30">Ativo</span>}
                  </button>
                </div>
              </div>

              {/* Módulos */}
              <div className="bg-black rounded-lg border border-gray-800 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-800">
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold">Módulos</p>
                </div>
                <div className="divide-y divide-gray-800/50">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                      <FileText className="text-[#D4AF37]" size={12} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-300">Global Notes</p>
                      <p className="text-[10px] text-gray-600">Bloco de notas flutuante</p>
                    </div>
                    <Toggle checked={isGlobalNotesEnabled} onChange={setGlobalNotesEnabled} />
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                      <Users className="text-[#D4AF37]" size={12} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-300">Social Proof</p>
                      <p className="text-[10px] text-gray-600">Notificações de novos membros</p>
                    </div>
                    <Toggle checked={isMemberNotificationsEnabled} onChange={setMemberNotificationsEnabled} />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-800 bg-black/50 shrink-0 flex justify-end">
              <button onClick={onClose} className="px-4 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-700 transition-colors">
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
