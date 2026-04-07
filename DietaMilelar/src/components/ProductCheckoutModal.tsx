import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle2, QrCode, Smartphone, Upload, Check, ExternalLink, FileImage } from 'lucide-react';
import { Button } from './Button';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface ProductCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductCheckoutModal: React.FC<ProductCheckoutModalProps> = ({ isOpen, onClose, product }) => {
  const { currentUser, referrer, globalSettings } = useData();

  const effectivePixKey  = (product?.useCustomPix && product?.pixKey) ? product.pixKey : (globalSettings.pixKey || '');
  const effectivePixType = (product?.useCustomPix && product?.pixKeyType) ? product.pixKeyType : (globalSettings.pixKeyType || 'random');
  const hasLink = !!product?.paymentLink;
  const hasPix  = !!effectivePixKey;

  const [copied, setCopied]             = useState(false);
  const [file, setFile]                 = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [success, setSuccess]           = useState(false);
  const [email, setEmail]               = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'link'>('pix');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setPaymentMethod(hasPix ? 'pix' : 'link');
  }, [isOpen, hasPix]);

  useEffect(() => {
    if (isOpen && currentUser?.email) setEmail(currentUser.email);
  }, [isOpen, currentUser]);

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
      navigator.clipboard.writeText(effectivePixKey).catch(() => fallback(effectivePixKey));
    } else {
      fallback(effectivePixKey);
    }
    setCopied(true);
    toast.success('Chave Pix copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(f.type)) { toast.error('Formato inválido. Use JPG, PNG, WEBP ou PDF.'); return; }
    if (f.size > 20 * 1024 * 1024) { toast.error('Arquivo muito grande. Máximo 20MB.'); return; }
    setFile(f);
    if (f.type !== 'application/pdf') {
      const reader = new FileReader();
      reader.onload = e => setProofPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setProofPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!currentUser && (!email || !email.includes('@'))) {
      toast.error('Por favor, insira um email válido para receber seu acesso.');
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem('auth_token') || '';
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload/proof', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Falha ao enviar comprovante');
      const { url } = await uploadRes.json();

      const amount = product?.offerPrice && product.offerPrice < product.price
        ? product.offerPrice : product?.price ?? 0;

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product_id: product?.id,
          product_name: product?.name,
          plan_name: product?.name,
          total_amount: amount,
          affiliate_id: referrer?.id || null,
          proof_url: url,
          status: 'pending',
        }),
      });
      if (!orderRes.ok) throw new Error('Falha ao registrar pedido');

      setUploading(false);
      setSuccess(true);
      setTimeout(() => {
        onClose(); setSuccess(false); setFile(null); setProofPreview(null); setEmail(''); setPaymentMethod('pix');
      }, 2000);
    } catch (err: any) {
      setUploading(false);
      toast.error(err.message || 'Erro ao processar. Tente novamente.');
    }
  };

  const handleClose = () => {
    setSuccess(false); setFile(null); setProofPreview(null); setCopied(false); onClose();
  };

  const displayPrice = product
    ? (+(product.offerPrice && product.offerPrice < product.price ? product.offerPrice : product.price)).toFixed(2)
    : '0.00';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
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
                <p className="text-[10px] text-gray-400">Produto: <span className="text-[#D4AF37] font-bold">{product?.name}</span></p>
              </div>
              <button onClick={handleClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
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
                  {/* Preço */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#D4AF37]">R$ {displayPrice}</span>
                      {product?.offerPrice && product.offerPrice < product.price && (
                        <span className="text-sm text-gray-500 line-through">R$ {(+product.price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
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

                  {/* Tabs PIX / Cartão */}
                  <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-lg">
                    {hasPix && (
                      <button
                        onClick={() => setPaymentMethod('pix')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          paymentMethod === 'pix' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <QrCode size={16} /> PIX
                      </button>
                    )}
                    {hasLink && (
                      <button
                        onClick={() => {
                          if (product?.paymentLink) window.open(product.paymentLink, '_blank', 'noopener,noreferrer');
                        }}
                        className="flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all text-gray-400 hover:text-white"
                      >
                        <ExternalLink size={16} /> Cartão ↗
                      </button>
                    )}
                  </div>

                  {/* PIX Content */}
                  {(paymentMethod === 'pix' || !hasLink) && hasPix && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
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
                            {effectivePixKey}
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

                      {/* Upload */}
                      <div className="space-y-4 mb-6">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          {proofPreview ? (
                            <img src={proofPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain" />
                          ) : file ? (
                            <div className="flex flex-col items-center gap-2">
                              <FileImage size={24} className="text-[#D4AF37]" />
                              <span className="text-xs text-gray-300 font-medium">{file.name}</span>
                              <span className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload size={24} className="text-gray-400" />
                              <span className="text-xs text-gray-300 font-medium">Clique para anexar o comprovante</span>
                              <span className="text-[10px] text-gray-500">JPG, PNG ou PDF</span>
                            </div>
                          )}
                        </div>
                        {file && (
                          <button
                            onClick={() => { setFile(null); setProofPreview(null); }}
                            className="text-[10px] text-gray-500 hover:text-red-400 transition-colors"
                          >
                            Remover arquivo
                          </button>
                        )}
                      </div>

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
                  )}

                  {/* Só link, sem pix */}
                  {!hasPix && hasLink && (
                    <a
                      href={product?.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-[#b5952f] transition-colors text-xs shine-effect"
                    >
                      <ExternalLink size={15} /> Ir para o Pagamento
                    </a>
                  )}

                  {/* Nenhum método */}
                  {!hasPix && !hasLink && (
                    <div className="text-center py-6 text-gray-500 text-xs">
                      Nenhuma forma de pagamento configurada para este produto.<br />
                      Entre em contato com o suporte.
                    </div>
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
