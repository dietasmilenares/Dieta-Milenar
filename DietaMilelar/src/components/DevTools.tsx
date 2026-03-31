import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import { Shield, Users, User, LogOut, Wrench } from 'lucide-react';

export const DevTools: React.FC = () => {
  const { setViewRole, logout, currentUser, isDevToolsEnabled } = useData();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = (role: UserRole, email: string) => {
    setViewRole(role);
    setIsOpen(false);
  };

  if (!isDevToolsEnabled) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 text-white p-3 rounded-full shadow-lg border border-gray-700 hover:bg-gray-800 transition-all"
          title="Ferramentas de Desenvolvimento"
        >
          <Wrench size={20} className="text-[#D4AF37]" />
        </button>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 w-64 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
            <h3 className="text-[#D4AF37] font-bold text-sm flex items-center gap-2">
              <Wrench size={14} />
              Acesso Rápido (Dev)
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-white"
            >
              &times;
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Alternar Perfil</div>
            
            <button
              onClick={() => handleLogin('ADMIN', 'admin@dietasmilenares.com')}
              className={`w-full flex items-center gap-3 p-2 rounded text-sm transition-colors ${currentUser?.role === 'ADMIN' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-black text-gray-300 hover:bg-gray-800'}`}
            >
              <Shield size={16} />
              Admin (Faraó)
            </button>

            <button
              onClick={() => handleLogin('REVENDA', 'joao@dietasmilenares.com')}
              className={`w-full flex items-center gap-3 p-2 rounded text-sm transition-colors ${currentUser?.role === 'REVENDA' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-black text-gray-300 hover:bg-gray-800'}`}
            >
              <Users size={16} />
              Revenda (Guardião)
            </button>

            <button
              onClick={() => handleLogin('MEMBRO', 'maria@dietasmilenares.com')}
              className={`w-full flex items-center gap-3 p-2 rounded text-sm transition-colors ${currentUser?.role === 'MEMBRO' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-black text-gray-300 hover:bg-gray-800'}`}
            >
              <User size={16} />
              Membro (Aluno)
            </button>

            <div className="border-t border-gray-800 my-2 pt-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-2 rounded text-sm bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors"
              >
                <LogOut size={16} />
                Sair (Logout)
              </button>
            </div>
          </div>

          {currentUser && (
            <div className="mt-4 pt-2 border-t border-gray-800 text-xs text-gray-500">
              Logado como: <span className="text-white font-bold">{currentUser.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
