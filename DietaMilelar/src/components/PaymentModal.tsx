import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle2, QrCode, Smartphone, Upload, Check, CreditCard } from 'lucide-react';
import { Button } from './Button';
import { useData } from '../context/DataContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../services/stripe';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  paymentLink?: string;
}

const CheckoutForm = ({ onSuccess, price }: { onSuccess: () => void, price: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Ocorreu um erro inesperado.");
    } else {
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        options={{
          layout: "tabs",
          theme: 'night',
          variables: {
            colorPrimary: '#D4AF37',
            colorBackground: '#1a1a1a',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'Montserrat, sans-serif',
            borderRadius: '8px',
          }
        }} 
      />
      {message && <div className="text-red-400 text-xs">{message}</div>}
      <Button 
        type="submit" 
        disabled={isLoading || !stripe || !elements} 
        fullWidth 
        className="bg-[#D4AF37] text-black font-bold hover:bg-[#b5952f]"
      >
        {isLoading ? "Processando..." : `Pagar ${price}`}
      </Button>
    </form>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, planName, price, paymentLink }) => {
  const { addTransaction, currentUser, referrer, login, globalSettings } = useData();
  const pixKey = globalSettings.pixKey || '';
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [clientSecret, setClientSecret] = useState("");

  // Preenche email automaticamente se o usuário estiver logado
  useEffect(() => {
    if (isOpen && currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [isOpen, currentUser]);

  const handleCardClick = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
    } else {
      setPaymentMethod('card');
    }
  };

  useEffect(() => {
    if (isOpen && paymentMethod === 'card') {
      // Create PaymentIntent as soon as the page loads
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: parseFloat(price.replace('R$', '').replace(',', '.').trim()),
          currency: 'brl' 
        }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [isOpen, paymentMethod, price]);

  const copyToClipboard = () => {
    const fallback = (text: string) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(pixKey).catch(() => fallback(pixKey));
    } else {
      fallback(pixKey);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    await processTransaction();
  };

  const processTransaction = async (status: 'pending' | 'approved' = 'pending') => {
    // Validar email se não estiver logado
    if (!currentUser && (!email || !email.includes('@'))) {
      toast.error('Por favor, insira um email válido para receber seu acesso.');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('auth_token') || '';

      // 1. Upload real do comprovante se houver arquivo
      let proofUrl: string | undefined;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload/proof', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('Falha ao enviar comprovante');
        const uploadData = await uploadRes.json();
        proofUrl = uploadData.url;
      }

      // 2. Criar order real no banco com proof_url
      const amount = parseFloat(price.replace('R$', '').replace(',', '.').trim());
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plan_name: planName,
          total_amount: amount,
          affiliate_id: referrer?.id || null,
          proof_url: proofUrl || null,
          status: proofUrl ? 'pending' : (status === 'approved' ? 'paid' : status),
        }),
      });
      if (!orderRes.ok) throw new Error('Falha ao registrar pedido');

      setUploading(false);
      setSuccess(true);

      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFile(null);
        setEmail('');
        setPaymentMethod('pix');
      }, 2000);

    } catch (err: any) {
      setUploading(false);
      toast.error(err.message || 'Erro ao processar. Tente novamente.');
    }
  };

  const handleCardSuccess = () => {
    processTransaction('approved');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#D4AF37]/10 to-transparent sticky top-0 bg-gray-900 z-10">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Finalizar Acesso</h3>
                <p className="text-[10px] text-gray-400">Protocolo: <span className="text-[#D4AF37] font-bold">{planName}</span></p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Check size={32} className="text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Comprovante Recebido!</h4>
                  <p className="text-sm text-gray-400">Seu acesso será liberado em até 24h — Não se preocupe, normalmente a liberação ocorre muito mais rápido que isso.</p>
                </div>
              ) : (
                <>
                  {/* Email Section */}
                  <div className="mb-6">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1.5 ml-1">
                      Seu melhor email
                    </label>
                    <input 
                      type="email" 
                      placeholder="Para receber seu acesso" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!!currentUser}
                      className={`w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-colors ${currentUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                      required
                    />
                    {currentUser && (
                      <p className="text-[9px] text-[#D4AF37] mt-1 ml-1">✓ Identificado automaticamente</p>
                    )}
                  </div>

                  {/* Payment Method Tabs */}
                  <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-lg">
                    <button
                      onClick={() => setPaymentMethod('pix')}
                      className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'pix' 
                          ? 'bg-[#D4AF37] text-black shadow-lg' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <QrCode size={16} /> PIX
                    </button>
                    <button
                      onClick={handleCardClick}
                      className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'card' && !paymentLink
                          ? 'bg-[#D4AF37] text-black shadow-lg' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <CreditCard size={16} /> Cartão{paymentLink ? ' ↗' : ''}
                    </button>
                  </div>

                  {paymentMethod === 'pix' ? (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      {/* PIX Section */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                        <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                          <QrCode size={20} />
                          <span className="font-bold uppercase tracking-wider text-xs">Pagamento via PIX</span>
                        </div>

                        <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
                          Utilize a chave abaixo para realizar o pagamento no seu banco.
                        </p>

                        <div className="relative group">
                          <div className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pr-10 font-mono text-xs text-white break-all">
                            {pixKey}
                          </div>
                          <button 
                            onClick={copyToClipboard}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-md transition-colors text-[#D4AF37]"
                            title="Copiar chave"
                          >
                            {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                          </button>
                        </div>
                        {copied && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[9px] text-green-400 mt-1.5 text-center font-bold"
                          >
                            Chave copiada!
                          </motion.p>
                        )}
                      </div>

                      {/* Upload Section */}
                      <div className="space-y-4 mb-6">
                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-[#D4AF37]/50 transition-colors cursor-pointer relative">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <Upload size={24} className="text-gray-400" />
                            <span className="text-xs text-gray-300 font-medium">
                              {file ? file.name : "Clique para anexar o comprovante"}
                            </span>
                            <span className="text-[10px] text-gray-500">JPG, PNG ou PDF</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        onClick={handleUpload}
                        fullWidth 
                        size="md" 
                        variant="primary"
                        disabled={!file || uploading}
                        className="shadow-[#D4AF37]/20 text-xs sm:text-sm font-bold shine-effect disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? "ENVIANDO..." : "ENVIAR COMPROVANTE"}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {clientSecret ? (
                        <Elements options={{ clientSecret, appearance: { theme: 'night' } }} stripe={stripePromise}>
                          <CheckoutForm onSuccess={handleCardSuccess} price={price} />
                        </Elements>
                      ) : (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest text-center">
                    <Smartphone size={10} />
                    <span>Ambiente Seguro</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
