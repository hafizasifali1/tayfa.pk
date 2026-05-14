import React from 'react';
import { Check, Truck, Package, CreditCard, ShoppingBag, RotateCcw, XCircle } from 'lucide-react';

interface Step {
  key: string;
  label: string;
  icon: React.ElementType;
  isFinal?: boolean;
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

// Return flow: shows on the single dynamic circle, one label at a time
const RETURN_FLOW: Step[] = [
  { key: 'return_requested',  label: 'Return Req.',  icon: RotateCcw },
  { key: 'return_approved',   label: 'Ret. Approved', icon: Check },
  { key: 'courier_submitted', label: 'Courier Sent', icon: Truck },
  { key: 'returned',          label: 'Returned',     icon: Package,   isFinal: true },
  { key: 'return_rejected',   label: 'Rejected',     icon: XCircle,   isFinal: true },
];

// Refund flow: shows on the single dynamic circle, one label at a time
const REFUND_FLOW: Step[] = [
  { key: 'refund_requested', label: 'Refund Req.', icon: RotateCcw },
  { key: 'refund_approved',  label: 'REF. Approved', icon: Check },
  { key: 'refunded',         label: 'Refunded',    icon: CreditCard, isFinal: true },
  { key: 'refund_rejected',  label: 'Rejected',    icon: XCircle,    isFinal: true },
];

const RETURN_KEYS = new Set(RETURN_FLOW.map(s => s.key));
const REFUND_KEYS = new Set(REFUND_FLOW.map(s => s.key));

type DynamicStep = Step & { displayStatus: 'active' | 'completed' };

function getMostAdvancedStep(flow: Step[], allStatuses: string[]): DynamicStep | null {
  let maxIdx = -1;
  for (const s of allStatuses) {
    const idx = flow.findIndex(f => f.key === s);
    if (idx > maxIdx) maxIdx = idx;
  }
  if (maxIdx === -1) return null;
  const step = flow[maxIdx];
  return { ...step, displayStatus: step.isFinal ? 'completed' : 'active' };
}

const BASE_STATUS_ORDER = BASE_STEPS.map(s => s.key);

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, history = [] }) => {
  const allStatuses = [status, ...history.map(h => h.status)];

  const hasReturnFlow = allStatuses.some(s => RETURN_KEYS.has(s));
  const hasRefundFlow = allStatuses.some(s => REFUND_KEYS.has(s));

  const dynamicStep: DynamicStep | null = hasReturnFlow
    ? getMostAdvancedStep(RETURN_FLOW, allStatuses)
    : hasRefundFlow
    ? getMostAdvancedStep(REFUND_FLOW, allStatuses)
    : null;

  const advancedBaseIdx = allStatuses.reduce((max, s) => {
    const idx = BASE_STATUS_ORDER.indexOf(s);
    return idx > max ? idx : max;
  }, -1);

  const getBaseStepStatus = (key: string): 'completed' | 'active' | 'upcoming' => {
    if (status === 'cancelled') return 'upcoming';
    const stepIdx = BASE_STATUS_ORDER.indexOf(key);
    if (advancedBaseIdx === -1) return 'upcoming';
    // Once a post-delivery flow starts, all base steps are completed
    if (dynamicStep !== null) return 'completed';
    if (stepIdx < advancedBaseIdx) return 'completed';
    if (stepIdx === advancedBaseIdx) return 'active';
    return 'upcoming';
  };

  const totalSteps = BASE_STEPS.length + (dynamicStep ? 1 : 0);

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="relative flex items-center py-6" style={{ minWidth: `${totalSteps * 72}px` }}>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-dark/5 -translate-y-1/2" />
        <div className="relative z-10 flex w-full justify-between">
          {BASE_STEPS.map((step) => {
            const stepStatus = getBaseStepStatus(step.key);
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 order-stepper-circle ${
                    stepStatus === 'completed'
                      ? 'bg-brand-gold text-white'
                      : stepStatus === 'active'
                      ? 'bg-brand-dark text-white ring-4 ring-brand-dark/10'
                      : 'bg-white text-brand-dark/20 border-2 border-brand-dark/5'
                  }`}
                >
                  {stepStatus === 'completed' ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <p className={`mt-2 text-[9px] font-bold uppercase tracking-wider order-stepper-label whitespace-nowrap ${
                  stepStatus === 'active' ? 'text-brand-dark' : 'text-brand-dark/40'
                }`}>
                  {step.label}
                </p>
              </div>
            );
          })}

          {dynamicStep && (() => {
            const DynIcon = dynamicStep.icon;
            return (
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 order-stepper-circle ${
                    dynamicStep.displayStatus === 'completed'
                      ? 'bg-brand-gold text-white'
                      : 'bg-brand-dark text-white ring-4 ring-brand-dark/10'
                  }`}
                >
                  {dynamicStep.displayStatus === 'completed' ? <Check size={16} /> : <DynIcon size={16} />}
                </div>
                <p className={`mt-2 text-[9px] font-bold uppercase tracking-wider order-stepper-label whitespace-nowrap ${
                  dynamicStep.displayStatus === 'active' ? 'text-brand-dark' : 'text-brand-dark/40'
                }`}>
                  {dynamicStep.label}
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
