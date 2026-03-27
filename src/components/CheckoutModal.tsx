import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Lock, AlertCircle } from 'lucide-react';
import stripePromise from '../services/stripe';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  price: number;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<{ price: number; onSuccess: () => void; onClose: () => void }> = ({ price, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Erro ao processar pagamento');
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Erro ao confirmar pagamento');
      setProcessing(false);
    } else {
      setProcessing(false);
      onSuccess();
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <label className="block text-sm font-medium text-gray-400 mb-4">Dados do Cartão</label>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg hover:bg-[#b5952f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Lock size={18} />
            Pagar R$ {price.toFixed(2)}
          </>
        )}
      </button>
      
      <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
        <Lock size={12} /> Pagamento 100% seguro via Stripe
      </p>
    </form>
  );
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, productName, price, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && price > 0) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: price,
          currency: 'brl' 
        }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => console.error("Error creating payment intent:", err));
    }
  }, [isOpen, price]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-[#D4AF37]" /> Checkout Seguro
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-400">Você está comprando:</p>
            <h3 className="text-lg font-bold text-white">{productName}</h3>
            <p className="text-2xl font-bold text-[#D4AF37] mt-2">R$ {price.toFixed(2)}</p>
          </div>

          {clientSecret ? (
            <Elements options={{ clientSecret, appearance: { theme: 'night' } }} stripe={stripePromise}>
              <CheckoutForm price={price} onSuccess={onSuccess} onClose={onClose} />
            </Elements>
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
