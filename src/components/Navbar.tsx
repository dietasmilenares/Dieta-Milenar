import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Shield, Crown, ShoppingBag, UserCheck, Eye, EyeOff, Menu, X, Maximize, Minimize, Lock } from 'lucide-react';
import { useData } from '../context/DataContext';

interface NavbarProps {
  onRegisterClick?: () => void;
  onTestimonialsClick?: () => void;
  onTesteClick?: () => void;
  onProblemClick?: () => void;
  onAboutUsClick?: () => void;
  onPlansPageClick?: () => void;
  onHomeClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onRegisterClick, 
  onTestimonialsClick, 
  onTesteClick, 
  onProblemClick,
  onAboutUsClick,
  onPlansPageClick,
  onHomeClick
}) => {
  const { currentUser, login, logout, globalSettings, referrer } = useData();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Just for UI, not real auth in this demo

  const [showMobileLogin, setShowMobileLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [showTerms, setShowTerms] = useState(false);

  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const navMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMobileLogin && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileLogin(false);
      }
      if (showNavMenu && navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setShowNavMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileLogin, showNavMenu]);

  const handleLogoClick = () => {
    if (onHomeClick) onHomeClick();
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at the very top
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else {
        // Hide while scrolling (any direction)
        setIsVisible(false);
        setShowMobileLogin(false);
        setShowNavMenu(false);
      }

      // Show again when scrolling stops
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    setShowMobileLogin(false);
  };

  const handleNavClick = (item: string) => {
    setShowNavMenu(false);
    
    if (item === 'Depoimentos' && onTestimonialsClick) {
      onTestimonialsClick();
      return;
    }

    if (item === 'O Problema' && onProblemClick) {
      onProblemClick();
      return;
    }

    if (item === 'Sobre Nós' && onAboutUsClick) {
      onAboutUsClick();
      return;
    }

    if (item === 'Planos' && onPlansPageClick) {
      onPlansPageClick();
      return;
    }

    // Handle Home
    if (item === 'Início' && onHomeClick) {
      onHomeClick();
      return;
    }
  };

  const goToDashboard = () => { window.location.href = '/'; };

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'ADMIN': return (
        <span onClick={goToDashboard} className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-red-500 transition-colors">
          <Shield size={8} /> ADMINISTRADOR
        </span>
      );
      case 'REVENDA': return (
        <span onClick={goToDashboard} className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-purple-500 transition-colors">
          <ShoppingBag size={8} /> REVENDA
        </span>
      );
      case 'VIP': return (
        <span onClick={goToDashboard} className="bg-[#FFD700] text-black text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-yellow-400 transition-colors">
          <Crown size={8} /> MEMBRO VIP
        </span>
      );
      case 'MEMBRO': return (
        <span onClick={goToDashboard} className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-blue-500 transition-colors">
          <UserCheck size={8} /> MEMBRO
        </span>
      );
      default: return (
        <span onClick={goToDashboard} className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-blue-500 transition-colors">
          <UserCheck size={8} /> MEMBRO
        </span>
      );
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
          className={`fixed ${referrer ? 'top-7 sm:top-8' : 'top-0'} left-0 w-full z-[60] bg-black/95 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-lg transition-all duration-300`}
        >
          <div className="container mx-auto px-4 h-12 md:h-14 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 shrink-0 cursor-pointer" onClick={handleLogoClick}>
              {globalSettings?.logoUrl ? (
                <img src={globalSettings.logoUrl} alt={globalSettings.appName} className="h-8 md:h-10 object-contain" />
              ) : (
                <span className="font-display font-bold text-base md:text-2xl tracking-tight select-none">
                  <span className="text-white">{globalSettings?.appName?.split(' ')[0] || 'DIETA'}</span>
                  <span className="text-golden-gradient ml-1">{globalSettings?.appName?.split(' ').slice(1).join(' ') || 'MILENAR'}</span>
                </span>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 ml-8">
              {['Início', 'Depoimentos', 'O Problema', 'Sobre Nós', 'Planos'].map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors text-[10px] uppercase tracking-widest font-bold"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={toggleFullScreen}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-[#D4AF37] transition-colors"
                title={isFullScreen ? "Sair da Tela Cheia" : "Tela Cheia"}
              >
                {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  {getRoleBadge()}
                  <button
                    onClick={() => { logout(); }}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors p-1"
                    title="Sair"
                  >
                    <LogOut size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setShowNavMenu(!showNavMenu);
                      setShowMobileLogin(false);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="lg:hidden text-[#D4AF37] hover:text-white transition-colors p-1"
                  >
                    {showNavMenu ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <form onSubmit={handleLogin} className="hidden md:flex items-center gap-2">
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-900 border border-gray-700 text-white text-[10px] px-2 py-1 rounded focus:outline-none focus:border-[#D4AF37] w-32"
                      required
                    />
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Senha" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-900 border border-gray-700 text-white text-[10px] px-2 py-1 pr-7 rounded focus:outline-none focus:border-[#D4AF37] w-24"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D4AF37] transition-colors"
                      >
                        {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <button 
                      type="submit"
                      className="golden-gradient-glow text-black text-[10px] font-bold px-3 py-1 rounded shine-effect"
                    >
                      ACESSAR
                    </button>
                  </form>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setShowMobileLogin(!showMobileLogin);
                        setShowNavMenu(false);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="md:hidden golden-gradient-glow text-black text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1"
                    >
                      <User size={14} />
                      {showMobileLogin ? 'FECHAR' : 'LOGIN'}
                    </button>

                    <button
                      onClick={() => {
                        setShowNavMenu(!showNavMenu);
                        setShowMobileLogin(false);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="lg:hidden text-[#D4AF37] hover:text-white transition-colors p-1"
                    >
                      {showNavMenu ? <X size={24} /> : <Menu size={24} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Login Dropdown */}
          <AnimatePresence>
            {showMobileLogin && !currentUser && (
              <motion.div
                ref={mobileMenuRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden bg-gray-900 border-t border-gray-800 p-4"
              >
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <input 
                    type="email" 
                    placeholder="Seu email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black border border-gray-700 text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#D4AF37] w-full"
                    required
                  />
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Sua senha" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-black border border-gray-700 text-white text-sm px-4 py-2.5 pr-12 rounded-lg focus:outline-none focus:border-[#D4AF37] w-full"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D4AF37] transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <button 
                    type="submit"
                    className="golden-gradient-glow text-black text-sm font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-transform"
                  >
                    ENTRAR NA ÁREA DE MEMBROS
                  </button>

                  <p className="text-[10px] text-center text-gray-400 mt-2">
                    Ainda não tem acesso? <button type="button" onClick={onRegisterClick} className="text-[#D4AF37] hover:underline">Clique aqui para se registrar</button> e comece sua jornada ancestral.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Menu Dropdown */}
          <AnimatePresence>
            {showNavMenu && (
              <motion.div
                ref={navMenuRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-black border-t border-[#D4AF37]/20 p-4"
              >
                <ul className="flex flex-col gap-4 text-center">
                  {currentUser && (
                    <li>
                      <button
                        onClick={() => { window.location.href = '/'; setShowNavMenu(false); }}
                        className="text-[#D4AF37] hover:text-white transition-colors font-heading text-lg uppercase tracking-widest"
                      >
                        Área do Membro
                      </button>
                    </li>
                  )}
                  {['Início', 'Depoimentos', 'O Problema', 'Sobre Nós', 'Planos'].map((item) => (
                    <li key={item}>
                      <button 
                        onClick={() => handleNavClick(item)}
                        className="text-white hover:text-[#D4AF37] transition-colors font-heading text-lg uppercase tracking-widest"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-[#D4AF37]/20">
                  <button onClick={() => { setShowTerms(true); setShowNavMenu(false); }} className="text-[10px] text-gray-400 hover:text-[#D4AF37] uppercase tracking-wider font-bold">Termos de Uso</button>
                  <span className="w-1 h-1 bg-gray-800 rounded-full mt-1.5"></span>
                  <button onClick={() => { setShowTerms(true); setShowNavMenu(false); }} className="text-[10px] text-gray-400 hover:text-[#D4AF37] uppercase tracking-wider font-bold">Privacidade</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terms Modal */}
          <AnimatePresence>
            {showTerms && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowTerms(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setShowTerms(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                  <h2 className="text-2xl font-bold text-white mb-6">Termos de Uso e Privacidade</h2>
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap">
                    {globalSettings?.termsOfUse || 'Nenhum termo definido pelo administrador.'}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
