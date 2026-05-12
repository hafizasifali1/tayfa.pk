import React from 'react';
import { Check, Truck, Package, CreditCard, ShoppingBag, RotateCcw, XCircle } from 'lucide-react';

interface Step {
  key: string;
  label: string;
  icon: React.ElementType;
}

interface OrderTimelineProps {
  status: string;
  history?: Array<{ status: string }>;
}

const BASE_STEPS: Step[] = [
  { key: 'pending',          label: 'Placed',           icon: ShoppingBag },
  { key: 'confirmed',        label: 'Confirmed',        icon: Check },
  { key: 'processing',       label: 'Processing',       icon: Package },
  { key: 'shipped',          label: 'Shipped',          icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered',        label: 'Delivered',        icon: Check },
];

const RETURN_STEPS: Step[] = [
  { key: 'return_requested',  label: 'Return Req.',  icon: RotateCcw },
  { key: 'return_approved',   label: 'Approved',     icon: Check },
  { key: 'courier_submitted', label: 'Courier Sent', icon: Truck },
  { key: 'returned',          label: 'Returned',     icon: Package },
];

const RETURN_REJECTED_STEPS: Step[] = [
  { key: 'return_requested', label: 'Return Req.', icon: RotateCcw },
  { key: 'return_rejected',  label: 'Rejected',    icon: XCircle },
];

const REFUND_STEPS: Step[] = [
  { key: 'refund_requested', label: 'Refund Req.', icon: RotateCcw },
  { key: 'refund_approved',  label: 'Approved',    icon: Check },
  { key: 'refunded',         label: 'Refunded',    icon: CreditCard },
];

const REFUND_REJECTED_STEPS: Step[] = [
  { key: 'refund_requested', label: 'Refund Req.', icon: RotateCcw },
  { key: 'refund_rejected',  label: 'Rejected',    icon: XCircle },
];

const RETURN_ALL = ['return_requested', 'return_approved', 'return_rejected', 'courier_submitted', 'returned'];
const REFUND_ALL = ['refund_requested', 'refund_approved', 'refund_rejected', 'refunded'];

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, history = [] }) => {
  const allStatuses = [status, ...history.map(h => h.status)];

  const hasReturnFlow = allStatuses.some(s => RETURN_ALL.includes(s));
  const hasRefundFlow = allStatuses.some(s => REFUND_ALL.includes(s));
  const isReturnRejected = allStatuses.includes('return_rejected');
  const isRefundRejected = allStatuses.includes('refund_rejected');

  const steps: Step[] = [
    ...BASE_STEPS,
    ...(hasReturnFlow ? (isReturnRejected ? RETURN_REJECTED_STEPS : RETURN_STEPS) : []),
    ...(hasRefundFlow ? (isRefundRejected ? REFUND_REJECTED_STEPS : REFUND_STEPS) : []),
  ];

  const statusOrder = steps.map(s => s.key);

  // Use the most-advanced status that has occurred (current + history) so the
  // progress bar advances even when the order's status field lags behind
  // (e.g. order stays "return_requested" in DB but history already has "return_approved").
  const advancedIdx = allStatuses.reduce((max, s) => {
    const idx = statusOrder.indexOf(s);
    return idx > max ? idx : max;
  }, -1);

  const getStepStatus = (key: string): 'completed' | 'active' | 'upcoming' => {
    if (status === 'cancelled') return 'upcoming';
    const stepIdx = statusOrder.indexOf(key);
    if (advancedIdx === -1 || stepIdx === -1) return 'upcoming';
    if (stepIdx < advancedIdx) return 'completed';
    if (stepIdx === advancedIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div className="relative flex justify-between items-center w-full py-8">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-dark/5 -translate-y-1/2" />
      {steps.map((step) => {
        const stepStatus = getStepStatus(step.key);
        const Icon = step.icon;
        return (
          <div key={step.key} className="relative z-10 flex flex-col items-center">
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
