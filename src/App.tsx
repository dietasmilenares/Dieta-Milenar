import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { SplashScreen } from './components/SplashScreen';
import { ProgressBar } from './components/ProgressBar';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { Testimonials } from './components/Testimonials';
import { Guarantee } from './components/Guarantee';
import { DuvidasFrequentesItem } from './types';
import { DuvidasFrequentes } from './components/FAQ';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { CookieBanner } from './components/CookieBanner';
import { UrgencyBanner } from './components/UrgencyBanner';
import { PaymentModal } from './components/PaymentModal';
import { AboutUs } from './components/AboutUs';
import { RegisterModal } from './components/RegisterModal';
import { getCourseSchema, getFAQSchema } from './utils/schemas';
import { DataProvider, useData } from './context/DataContext';
import { ContentProvider } from './hooks/useContent';
import { Navbar } from './components/Navbar';
import { TopBanner } from './components/TopBanner';
import { AdminDashboard } from './components/AdminDashboard';
import { ResellerDashboard } from './components/ResellerDashboard';

import { StudentDashboard } from './components/StudentDashboard';
import { SocialProofOverlay } from './components/SocialProofOverlay';
import { GlobalNotes } from './components/GlobalNotes';

import { TestimonialsPage } from './components/TestimonialsPage';
import { TestePage } from './components/TestePage';
import { ProblemPage } from './components/ProblemPage';
import { PlansPage } from './components/PlansPage';

const MainContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [showProblemPage, setShowProblemPage] = useState(false);
  const [showPlansPage, setShowPlansPage] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: '', price: '', paymentLink: '' });
  const [pendingPlan, setPendingPlan] = useState<{ name: string; price: string; paymentLink: string } | null>(null);
  const [footerOffset, setFooterOffset] = useState(0);
  const { currentUser, realUser, viewRole, showTeste, setShowTeste } = useData();
  const effectiveRole = currentUser ? (viewRole || currentUser?.role) : null;

  // Scroll to top when page state changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showTestimonials, showProblemPage, showPlansPage, showTeste]);

  // Track footer visibility for sticky push effect
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById('main-footer');
      if (!footer) {
        setFooterOffset(22);
        return;
      }

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (footerRect.top < windowHeight) {
        setFooterOffset(Math.max(22, windowHeight - footerRect.top));
      } else {
        setFooterOffset(22);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, showTestimonials, showProblemPage, showPlansPage, showTeste]);

  // Navigation to plans page
  const goToPlansPage = () => {
    setShowTestimonials(false);
    setShowProblemPage(false);
    setShowPlansPage(true);
    setShowTeste(false);
    window.scrollTo(0, 0);
  };

  // Smooth scroll to pricing (kept for backward compatibility if needed, but updated to use plans page if element not found)
  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      setShowTestimonials(false);
      setShowProblemPage(false);
      setShowPlansPage(false);
      setShowTeste(false);
      
      setTimeout(() => {
        const navbarHeight = 60;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 100);
    } else {
      goToPlansPage();
    }
  };

  const handleSelectPlan = (name: string, price: string, paymentLink?: string) => {
    const plan = { name, price, paymentLink: paymentLink || '' };
    if (!currentUser) {
      // Salva o plano pendente e abre o cadastro
      setPendingPlan(plan);
      setIsRegisterOpen(true);
    } else {
      setSelectedPlan(plan);
      setIsPaymentModalOpen(true);
    }
  };

  // SEO Schema Injection
  useEffect(() => {
    if (!loading) {
      const scriptCourse = document.createElement('script');
      scriptCourse.type = 'application/ld+json';
      scriptCourse.text = getCourseSchema();
      document.head.appendChild(scriptCourse);

      const scriptFAQ = document.createElement('script');
      scriptFAQ.type = 'application/ld+json';
      // Mock items for schema generation to match component
      const faqItems: DuvidasFrequentesItem[] = [
        { id: '1', question: "Preciso de equipamentos?", answer: "Não! Todo o método é baseado no Pilates Solo..." },
         // ... others
      ];
      scriptFAQ.text = getFAQSchema(faqItems);
      document.head.appendChild(scriptFAQ);
      
      return () => {
        if (document.head.contains(scriptCourse)) {
          document.head.removeChild(scriptCourse);
        }
        if (document.head.contains(scriptFAQ)) {
          document.head.removeChild(scriptFAQ);
        }
      }
    }
  }, [loading]);

  const renderPublicContent = () => {
    if (showTestimonials) {
      return <TestimonialsPage 
        onBack={() => {
          setShowTestimonials(false);
          window.scrollTo(0, 0);
        }} 
        onRegisterClick={() => setIsRegisterOpen(true)}
        onTesteClick={() => {
          setShowTestimonials(false);
          setShowTeste(true);
        }}
        onProblemClick={() => {
          setShowTestimonials(false);
          setShowProblemPage(true);
        }}
        onAboutUsClick={() => setIsAboutUsOpen(true)}
        onPlansPageClick={() => {
          setShowTestimonials(false);
          setShowPlansPage(true);
        }}
      />;
    }

    if (showProblemPage) {
      return <ProblemPage 
        onBack={() => {
          setShowProblemPage(false);
          window.scrollTo(0, 0);
        }} 
        onRegisterClick={() => setIsRegisterOpen(true)}
        onTesteClick={() => {
          setShowProblemPage(false);
          setShowTeste(true);
        }}
        onTestimonialsClick={() => {
          setShowProblemPage(false);
          setShowTestimonials(true);
        }}
        onAboutUsClick={() => setIsAboutUsOpen(true)}
        onPlansPageClick={() => {
          setShowProblemPage(false);
          setShowPlansPage(true);
        }}
      />;
    }

    if (showPlansPage) {
      return (
        <div className="font-sans text-gray-300 antialiased selection:bg-[#D4AF37] selection:text-black bg-black min-h-screen">
          <PlansPage 
            onBack={() => {
              setShowPlansPage(false);
              window.scrollTo(0, 0);
            }} 
            onSelectPlan={handleSelectPlan}
          />
        </div>
      );
    }

    if (showTeste) {
      return <TestePage onBack={() => {
        setShowTeste(false);
        window.scrollTo(0, 0);
      }} />;
    }

    return (
      <motion.div 
        key="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <TopBanner />
        <ProgressBar />
        <main>
          <Hero onCTAClick={goToPlansPage} />
          <ProblemSection />
          <SolutionSection />
          <Testimonials />
          <Guarantee />
          <DuvidasFrequentes />
        </main>
        <Footer />
      </motion.div>
    );
  };

  const isHomeForced = new URLSearchParams(window.location.search).get('home') === 'true';

  if (effectiveRole === 'ADMIN' && !isHomeForced && !pendingPlan && !isPaymentModalOpen) {
    if (showTeste) {
      return <TestePage onBack={() => { setShowTeste(false); window.scrollTo(0, 0); }} />;
    }
    return (
      <div className="font-sans text-gray-300 antialiased selection:bg-[#D4AF37] selection:text-black bg-black min-h-screen">
        <AdminDashboard />
        <GlobalNotes />
      </div>
    );
  }

  if (effectiveRole === 'REVENDA' && !isHomeForced && !pendingPlan && !isPaymentModalOpen) {
    return (
      <div className="font-sans text-gray-300 antialiased selection:bg-[#D4AF37] selection:text-black bg-black min-h-screen">
        <ResellerDashboard />
        <GlobalNotes />
      </div>
    );
  }

  if ((effectiveRole === 'MEMBRO' || effectiveRole === 'VIP' || effectiveRole === 'VISITANTE') && !isHomeForced && !pendingPlan && !isPaymentModalOpen) {
    return (
      <div className="font-sans text-gray-300 antialiased selection:bg-[#D4AF37] selection:text-black bg-black min-h-screen">
        <StudentDashboard />
        <GlobalNotes />
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-300 antialiased selection:bg-[#D4AF37] selection:text-black bg-black">
      {loading ? null : (
        <Navbar 
          onRegisterClick={() => setIsRegisterOpen(true)} 
          onTestimonialsClick={() => {
            setShowTestimonials(true);
            setShowProblemPage(false);
            setShowPlansPage(false);
            setShowTeste(false);
            window.scrollTo(0, 0);
          }}
          onTesteClick={() => {
            setShowTestimonials(false);
            setShowProblemPage(false);
            setShowPlansPage(false);
            setShowTeste(true);
            window.scrollTo(0, 0);
          }}
          onProblemClick={() => {
            setShowTestimonials(false);
            setShowProblemPage(true);
            setShowPlansPage(false);
            setShowTeste(false);
            window.scrollTo(0, 0);
          }}
          onAboutUsClick={() => setIsAboutUsOpen(true)}
          onPlansPageClick={() => {
            setShowTestimonials(false);
            setShowProblemPage(false);
            setShowPlansPage(true);
            setShowTeste(false);
            window.scrollTo(0, 0);
          }}
          onHomeClick={() => {
            setShowTestimonials(false);
            setShowProblemPage(false);
            setShowPlansPage(false);
            setShowTeste(false);
            window.scrollTo(0, 0);
          }}
        />
      )}
      <AnimatePresence mode="wait">
        {loading ? (
          <SplashScreen key="splash" onComplete={() => setLoading(false)} />
        ) : (
          <>
            {renderPublicContent()}
            {!(showTestimonials || showProblemPage || showPlansPage) && (
              <>
                <UrgencyBanner onCTAClick={goToPlansPage} footerOffset={footerOffset} />
                <SocialProofOverlay />
              </>
            )}
            <ChatWidget footerOffset={footerOffset} />
            <GlobalNotes />

            <AboutUs 
              isOpen={isAboutUsOpen} 
              onClose={() => setIsAboutUsOpen(false)} 
            />

            <RegisterModal
              isOpen={isRegisterOpen}
              onClose={() => { setIsRegisterOpen(false); setPendingPlan(null); }}
              onSuccess={() => {
                setIsRegisterOpen(false);
                if (pendingPlan) {
                  setSelectedPlan(pendingPlan);
                  setIsPaymentModalOpen(true);
                  setPendingPlan(null);
                }
              }}
            />

            <PaymentModal 
              isOpen={isPaymentModalOpen} 
              onClose={() => setIsPaymentModalOpen(false)}
              planName={selectedPlan.name}
              price={selectedPlan.price}
              paymentLink={selectedPlan.paymentLink}
            />
          </>
        )}
      </AnimatePresence>
      <CookieBanner />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ContentProvider>
      <DataProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
        <MainContent />
      </DataProvider>
    </ContentProvider>
  );
};

export default App;