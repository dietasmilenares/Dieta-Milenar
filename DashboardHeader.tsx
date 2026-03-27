import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, X, LogOut, Home, Maximize, Minimize, FlaskConical, ChevronDown,
  BarChart2, BookOpen, Gift, Package, CreditCard, Users, Handshake, DollarSign, Settings,
  MessageSquare, Palette, FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface DashboardHeaderProps {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  hideMenu?: boolean;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

const NAV_GROUPS = [
  {
    label: 'Gestão de Membros',
    emoji: '👥',
    items: [
      { tab: 'users', label: 'Usuários', icon: <Users size={15} /> },
    ],
  },
  {
    label: 'Gestão de Revendas',
    emoji: '🤝',
    items: [
      { tab: 'affiliates',  label: 'Revendedores', icon: <Handshake size={15} /> },
      { tab: 'withdrawals', label: 'Saques',        icon: <DollarSign size={15} /> },
    ],
  },
  {
    label: 'Gestão de Mídia',
    emoji: '📚',
    items: [
      { tab: 'library', label: 'Biblioteca', icon: <BookOpen size={15} /> },
      { tab: 'bonuses', label: 'Bônus',      icon: <Gift size={15} /> },
    ],
  },
  {
    label: 'Gestão Financeira',
    emoji: '💰',
    items: [
      { tab: 'plans',    label: 'Planos',   icon: <CreditCard size={15} /> },
      { tab: 'products', label: 'Produtos', icon: <Package size={15} /> },
    ],
  },
  {
    label: 'Manutenção',
    emoji: '⚙',
    items: [
      { tab: 'settings',          label: 'Configurações Globais',    icon: <Settings size={15} /> },
      { tab: 'settings_checkout', label: 'Integrações de Checkout',  icon: <CreditCard size={15} /> },
      { tab: 'settings_support',  label: 'Canais de Suporte',        icon: <MessageSquare size={15} /> },
      { tab: 'settings_theme',    label: 'Tema',                     icon: <Palette size={15} /> },
      { tab: 'settings_legal',    label: 'Textos Legais',            icon: <FileText size={15} /> },
      { tab: 'template_preview',  label: 'Template Preview',         icon: <FlaskConical size={15} /> },
    ],
  },
];

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title, icon, hideMenu, children, onTabChange, activeTab
}) => {
  const { currentUser, realUser, setViewRole, logout, setShowTeste } = useData();
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [openGroup, setOpenGroup]     = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') return;
    const token = localStorage.getItem('auth_token') || '';
    fetch('/api/reseller-requests', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) setPendingRequests(data.filter((r: any) => r.status === 'pending').length);
      })
      .catch(() => {});
  }, [currentUser]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const handleTab = (tab: string) => {
    if (tab === 'template_preview') {
      setShowTeste(true);
      setIsMenuOpen(false);
      return;
    }
    onTabChange?.(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-md border-b border-gray-800 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!hideMenu && (
            <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors">
              <Menu size={24} />
            </button>
          )}
          <div className="flex items-center gap-2">
            {icon}
            <h1 className="text-lg font-bold text-white font-heading hidden sm:block">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {children}
          <button onClick={toggleFullScreen} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-[#D4AF37] transition-colors hidden sm:block" title={isFullScreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}>
            {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
            <span className="text-xs font-bold text-[#D4AF37]">{currentUser?.name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-gray-900 border-r border-gray-800 z-[60] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <span className="font-heading font-bold text-[#D4AF37] text-xl">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {/* User Info */}
                <div className="bg-black/50 p-4 rounded-lg border border-gray-800 mb-4">
                  <p className="text-white font-bold">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  <span className="inline-block mt-2 text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    {currentUser?.role === 'ADMIN' ? 'ADMINISTRADOR' : currentUser?.role === 'VIP' ? 'MEMBRO VIP' : currentUser?.role}
                  </span>
                </div>

                {/* Início */}
                <button
                  onClick={() => { window.location.href = '/?home=true'; setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left text-sm"
                >
                  <span>🏠</span> Início
                </button>

                {/* Dashboard */}
                <button
                  onClick={() => handleTab('dashboard')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left text-sm font-bold ${activeTab === 'dashboard' ? 'bg-[#D4AF37] text-black' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <span>📊</span> Dashboard
                </button>

                {/* Grupos accordion */}
                {NAV_GROUPS.map(group => {
                  const isOpen    = openGroup === group.label;
                  const hasActive = group.items.some(i => i.tab === activeTab);
                  return (
                    <div key={group.label} className="rounded-lg overflow-hidden border border-gray-800">
                      <button
                        onClick={() => setOpenGroup(isOpen ? null : group.label)}
                        className={`w-full flex items-center justify-between p-3 transition-colors text-sm font-bold ${hasActive ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                      >
                        <span className="flex items-center gap-2">{group.emoji} {group.label}</span>
                        <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-black/30"
                          >
                            {group.items.map(item => (
                              <button
                                key={item.tab}
                                onClick={() => handleTab(item.tab)}
                                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors text-left ${activeTab === item.tab ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                              >
                                {item.icon} {item.label}
                                {item.tab === 'affiliates' && pendingRequests > 0 && (
                                  <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                                    {pendingRequests}
                                  </span>
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

              </div>

              <div className="p-4 border-t border-gray-800">
                <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-900/20 text-red-500 hover:bg-red-900/30 transition-colors font-bold justify-center">
                  <LogOut size={18} /> Sair
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
