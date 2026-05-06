import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Wallet,
  Truck,
  Smartphone,
  Banknote,
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface Gateway {
  id: string;
  name: string;
  code: string;
  type: string;
  isDefault: boolean;
}

interface PaymentSelectionProps {
  amount: number;
  currency: string;
  orderId: string;
  onPaymentInitiated: (result: any) => void;
  onCancel: () => void;
}

/* Per-gateway icon + accent colour */
const getGatewayMeta = (name: string, type: string) => {
  const n = name.toLowerCase();
  if (n.includes('paypal'))     return { Icon: CreditCard,  accent: '#003087', label: 'PayPal' };
  if (n.includes('easypaisa'))  return { Icon: Smartphone,  accent: '#1C8C45', label: 'EasyPaisa' };
  if (n.includes('jazzcash'))   return { Icon: Wallet,      accent: '#D9232B', label: 'JazzCash' };
  if (n.includes('stripe'))     return { Icon: CreditCard,  accent: '#635BFF', label: 'Stripe' };
  if (type === 'cod')           return { Icon: Truck,       accent: 'var(--color-brand-gold-dark)', label: 'Cash on Delivery' };
  if (type === 'wallet')        return { Icon: Wallet,      accent: 'var(--color-brand-dark)', label: name };
  return                               { Icon: Banknote,    accent: 'var(--color-brand-dark)', label: name };
};

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
  amount,
  currency,
  orderId,
  onPaymentInitiated,
  onCancel,
}) => {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchEligibleGateways(); }, []);

  const fetchEligibleGateways = async () => {
    try {
      const res = await fetch(
        `/api/payments/checkout/gateways?region=${currency === 'PKR' ? 'PK' : 'US'}&currency=${currency}&userType=customer`
      );
      const data = await res.json();
      setGateways(data);
      const defaultGateway =
        data.find((g: Gateway) => g.type === 'cod') ||
        data.find((g: Gateway) => g.isDefault) ||
        data[0];
      if (defaultGateway) setSelectedGateway(defaultGateway);
    } catch {
      setError('Failed to load payment methods. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    if (!selectedGateway) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/checkout/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayCode: selectedGateway.code, amount, currency, orderId }),
      });
      const data = await res.json();
      if (res.ok) {
        onPaymentInitiated({
          ...data,
          gatewayCode: selectedGateway.code,
          gatewayName: selectedGateway.name,
          gatewayType: selectedGateway.type,
        });
      } else {
        setError(data.message || 'Payment initiation failed. Please try another method.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-brand-gold)' }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-dark-muted)' }}>
          Loading payment methods…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Section heading ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2
            className="text-3xl font-serif tracking-tight"
            style={{ color: 'var(--color-brand-dark)' }}
          >
            Payment Method
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-brand-dark-muted)' }}
          >
            Select your preferred way to pay securely.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border mt-1"
          style={{
            color: '#15803d',
            background: '#f0fdf4',
            borderColor: '#bbf7d0',
          }}
        >
          <ShieldCheck size={12} />
          Secure Checkout
        </div>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-4 rounded-2xl border"
            style={{ background: '#fff1f2', borderColor: '#fecdd3', color: '#be123c' }}
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gateway list ── */}
      <div className="space-y-3">
        {gateways.map((gateway) => {
          const { Icon, accent, label } = getGatewayMeta(gateway.name, gateway.type);
          const isSelected = selectedGateway?.id === gateway.id;

          return (
            <motion.button
              key={gateway.id}
              onClick={() => setSelectedGateway(gateway)}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.998 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full text-left relative overflow-hidden rounded-2xl border-2 transition-all duration-150"
              style={{
                background: isSelected
                  ? 'var(--color-brand-cream)'
                  : 'white',
                borderColor: isSelected
                  ? 'var(--color-brand-gold)'
                  : 'var(--color-brand-cream-dark)',
                boxShadow: isSelected
                  ? '0 0 0 1px var(--color-brand-gold-light), 0 2px 12px rgba(197,160,89,0.08)'
                  : '0 1px 3px rgba(26,26,26,0.04)',
              }}
            >
              {/* Gold left accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-150"
                style={{
                  background: isSelected ? 'var(--color-brand-gold)' : 'transparent',
                  borderRadius: '2px 0 0 2px',
                }}
              />

              <div className="flex items-center justify-between px-5 py-4 pl-6">
                <div className="flex items-center gap-4">
                  {/* Method icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150"
                    style={{
                      background: isSelected ? accent + '18' : 'var(--color-brand-cream-dark)',
                      color: isSelected ? accent : 'var(--color-brand-dark-muted)',
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  {/* Name + badge */}
                  <div>
                    <p
                      className="font-semibold text-sm tracking-tight"
                      style={{ color: 'var(--color-brand-dark)' }}
                    >
                      {gateway.name}
                    </p>
                    <span
                      className="inline-block text-[9px] font-bold uppercase tracking-widest mt-0.5 px-2 py-0.5 rounded-full"
                      style={{
                        background: gateway.type === 'cod'
                          ? 'var(--color-brand-gold-light)' + '50'
                          : 'var(--color-brand-cream-dark)',
                        color: gateway.type === 'cod'
                          ? 'var(--color-brand-gold-dark)'
                          : 'var(--color-brand-dark-muted)',
                      }}
                    >
                      {gateway.type === 'cod' ? 'Pay on Delivery' : 'Instant Payment'}
                    </span>
                  </div>
                </div>

                {/* Checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CheckCircle2
                        size={22}
                        style={{ color: 'var(--color-brand-gold)' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Pay button ── */}
      <motion.button
        disabled={isProcessing || !selectedGateway}
        onClick={handleInitiatePayment}
        whileHover={{ scale: isProcessing ? 1 : 1.01 }}
        whileTap={{ scale: isProcessing ? 1 : 0.99 }}
        transition={{ duration: 0.15 }}
        className="w-full py-5 rounded-2xl font-bold text-base tracking-widest uppercase flex items-center justify-center gap-3 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'var(--color-brand-dark)',
          color: 'var(--color-brand-cream)',
        }}
        onMouseEnter={(e) => {
          if (!isProcessing) (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-brand-gold-dark)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-brand-dark)';
        }}
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Processing…</span>
          </>
        ) : (
          <>
            <Lock size={16} />
            <span>
              Pay {currency} {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <ChevronRight size={16} />
          </>
        )}
      </motion.button>

      {/* ── Security badges ── */}
      <div
        className="flex items-center justify-center gap-6 pt-1"
        style={{ color: 'var(--color-brand-dark-muted)', opacity: 0.5 }}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
          <Lock size={11} />
          SSL Encrypted
        </div>
        <div
          className="w-px h-3"
          style={{ background: 'var(--color-brand-dark-muted)' }}
        />
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck size={11} />
          PCI Compliant
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;
