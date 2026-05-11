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

  // Dynamic last two states
  if (status === 'refund_requested' || status === 'refunded' || status === 'refund_rejected') {
    steps.push({ id: 'refund_requested', label: 'Refund Requested', icon: RotateCcw });
    steps.push({ id: 'refunded', label: 'Refunded', icon: CreditCard });
  } else if (status === 'return_requested' || status === 'returned') {
    steps.push({ id: 'return_requested', label: 'Return Requested', icon: RotateCcw });
    steps.push({ id: 'returned', label: 'Returned', icon: Check });
  } else {
    steps.push({ id: 'return_requested', label: 'Return Requested', icon: RotateCcw });
    steps.push({ id: 'refunded', label: 'Refunded', icon: CreditCard });
  }

  const getStepStatus = (stepId: string) => {
    const statusOrder = [
      'pending', 'confirmed', 'processing', 'shipped', 'delivered', 
      'refund_requested', 'return_requested', 'refunded', 'returned'
    ];
    
    const currentIdx = statusOrder.indexOf(status);
    const stepIdx = statusOrder.indexOf(stepId);

    if (status === 'cancelled') return 'upcoming';
    if (currentIdx === -1) return 'upcoming'; 

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    
    // Special case for mutual exclusion: if we are in 'refunded', the 'returned' step is irrelevant and vice versa
    return 'upcoming';
  };


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
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 order-stepper-circle ${
                stepStatus === 'completed' 
                  ? 'bg-brand-gold text-white' 
                  : stepStatus === 'active'
                  ? 'bg-brand-dark text-white ring-4 ring-brand-dark/10'
                  : 'bg-white text-brand-dark/20 border-2 border-brand-dark/5'
              }`}
            >
              {stepStatus === 'completed' ? <Check size={18} /> : <Icon size={18} />}
            </div>
            <p className={`mt-3 text-[10px] font-bold uppercase tracking-widest order-stepper-label ${
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
