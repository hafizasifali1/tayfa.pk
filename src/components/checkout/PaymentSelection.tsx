import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Wallet, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  Lock,
  ChevronRight,
  Loader2,
  AlertCircle
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

const PaymentSelection: React.FC<PaymentSelectionProps> = ({ 
  amount, 
  currency, 
  orderId, 
  onPaymentInitiated,
  onCancel
}) => {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEligibleGateways();
  }, []);

  const fetchEligibleGateways = async () => {
    try {
      const response = await fetch(`/api/payments/checkout/gateways?region=${currency === 'PKR' ? 'PK' : 'US'}&currency=${currency}&userType=customer`);
      const data = await response.json();
      setGateways(data);
      const defaultGateway = data.find((g: Gateway) => g.isDefault) || data[0];
      if (defaultGateway) setSelectedGateway(defaultGateway);
    } catch (error) {
      console.error('Error fetching gateways:', error);
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
      const response = await fetch('/api/payments/checkout/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewayCode: selectedGateway.code,
          amount,
          currency,
          orderId
        })
      });
      const data = await response.json();
      if (response.ok) {
        onPaymentInitiated({ ...data, gatewayCode: selectedGateway.code, gatewayName: selectedGateway.name, gatewayType: selectedGateway.type });
      } else {
        setError(data.message || 'Payment initiation failed. Please try another method.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="w-5 h-5" />;
      case 'wallet': return <Wallet className="w-5 h-5" />;
      case 'cod': return <Truck className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-10 h-10 text-black animate-spin" />
        <p className="text-gray-500 font-medium">Loading secure payment methods...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Payment Method</h2>
          <p className="text-gray-500 text-sm mt-1">Select your preferred way to pay securely.</p>
        </div>
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 border border-red-100"
        >
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      <div className="space-y-4 mb-8">
        {gateways.map((gateway) => (
          <motion.div
            key={gateway.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedGateway(gateway)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
              selectedGateway?.id === gateway.id 
                ? 'border-black bg-white shadow-md' 
                : 'border-transparent bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${selectedGateway?.id === gateway.id ? 'bg-black text-white' : 'bg-white text-gray-600 shadow-sm'}`}>
                {getIcon(gateway.type)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{gateway.name}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{gateway.type === 'cod' ? 'Pay on Delivery' : 'Instant Payment'}</p>
              </div>
            </div>
            {selectedGateway?.id === gateway.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle2 className="w-6 h-6 text-black" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <button
          disabled={isProcessing || !selectedGateway}
          onClick={handleInitiatePayment}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay {currency} {amount.toLocaleString()}
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-4 text-gray-400 text-xs font-medium">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            SSL Encrypted
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            PCI Compliant
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;
