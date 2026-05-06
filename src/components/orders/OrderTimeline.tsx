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
    { id: 'return_requested', label: 'Return Requested', icon: RotateCcw },
    { id: 'refunded', label: 'Refunded', icon: CreditCard },
  ];

  const getStepStatus = (stepId: string) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'return_requested', 'refunded'];
    const currentIdx = statusOrder.indexOf(status);
    const stepIdx = statusOrder.indexOf(stepId);

    if (status === 'cancelled') return 'upcoming';
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
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
