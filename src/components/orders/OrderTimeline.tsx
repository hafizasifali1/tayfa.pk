import React from 'react';
import { Check, Truck, Package, CreditCard, ShoppingBag, RotateCcw } from 'lucide-react';

interface OrderTimelineProps {
  status: string;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const steps = [
    { id: 'pending', label: 'Placed', icon: ShoppingBag },
    { id: 'confirmed', label: 'Confirmed', icon: Check },
    { id: 'processing', label: 'Processing', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: Check },
  ];

  const getStepStatus = (stepId: string) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed'];
    const currentIdx = statusOrder.indexOf(status);
    const stepIdx = statusOrder.indexOf(stepId);

    if (status === 'cancelled') return 'cancelled';
    if (status === 'returned') return 'returned';
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'upcoming';
  };

  if (status === 'cancelled') {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
        <p className="text-sm font-bold uppercase tracking-widest">Order Cancelled</p>
      </div>
    );
  }

  if (status === 'returned' || status === 'refunded') {
    return (
      <div className="flex items-center justify-center p-4 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
        <RotateCcw className="mr-2" size={18} />
        <p className="text-sm font-bold uppercase tracking-widest">Order Returned / Refunded</p>
      </div>
    );
  }

  return (
    <div className="relative flex justify-between items-center w-full py-8">
      {/* Connector Line */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-dark/5 -translate-y-1/2" />
      
      {steps.map((step, idx) => {
        const stepStatus = getStepStatus(step.id);
        const Icon = step.icon;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                stepStatus === 'completed' 
                  ? 'bg-brand-gold text-white' 
                  : stepStatus === 'active'
                  ? 'bg-brand-dark text-white ring-4 ring-brand-dark/10'
                  : 'bg-white text-brand-dark/20 border-2 border-brand-dark/5'
              }`}
            >
              {stepStatus === 'completed' ? <Check size={18} /> : <Icon size={18} />}
            </div>
            <p className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${
              stepStatus === 'active' ? 'text-brand-dark' : 'text-brand-dark/40'
            }`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
