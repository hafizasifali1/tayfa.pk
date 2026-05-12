import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck,
  Eye
} from 'lucide-react';
import { Button } from '../ui/Button';
import CancelOrderModal from './CancelOrderModal';

import RefundReviewModal from './RefundReviewModal';
import ReturnReviewModal from './ReturnReviewModal';

interface OrderActionButtonsProps {
  orderId: string;
  status: string;
  isUpdating: boolean;
  onUpdateStatus: (id: string, status: string, comment: string) => void | Promise<void>;
  onCreateShipment: (id: string, data: { carrier: string; trackingNumber: string }) => void | Promise<void>;
  onSuccess?: () => Promise<void>;
}

const TERMINAL_STATES = ['cancelled', 'refunded'];

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  orderId,
  status,
  isUpdating,
  onUpdateStatus,
  onCreateShipment,
  onSuccess,
}) => {
  const [tracking, setTracking] = useState({ carrier: '', trackingNumber: '' });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleCancelConfirm = async (reason: string) => {
    await onUpdateStatus(orderId, 'cancelled', reason);
    setShowCancelModal(false);
  };

  if (TERMINAL_STATES.includes(status)) return null;

  const CancelBtn = (
    <>
      <Button
        onClick={() => setShowCancelModal(true)}
        disabled={isUpdating}
        variant="outline"
        className="w-full h-12 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 transition-all font-bold text-[10px] uppercase tracking-widest order-toolbar-btn"
      >
        <XCircle size={18} className="mr-2" />
        Cancel
      </Button>
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        isUpdating={isUpdating}
      />
    </>
  );

  if (status === 'pending') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => onUpdateStatus(orderId, 'confirmed', 'Order confirmed by admin')}
          disabled={isUpdating}
          className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all font-bold text-[10px] uppercase tracking-widest order-toolbar-btn"
        >
          <CheckCircle size={18} className="mr-2" />
          Confirm Order
        </Button>
        {CancelBtn}
      </div>
    );
  }

  if (status === 'confirmed') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => onUpdateStatus(orderId, 'processing', 'Order is being processed')}
          disabled={isUpdating}
          className="w-full h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all font-bold text-[10px] uppercase tracking-widest order-toolbar-btn"
        >
          <Package size={18} className="mr-2" />
          Start Processing
        </Button>
        {CancelBtn}
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="space-y-4 p-6 bg-brand-cream/30 rounded-3xl border border-brand-dark/5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Tracking Details</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Carrier (e.g. TCS)"
            value={tracking.carrier}
            onChange={(e) => setTracking((p) => ({ ...p, carrier: e.target.value }))}
            className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-xl text-sm focus:outline-none focus:border-brand-gold"
          />
          <input
            type="text"
            placeholder="Tracking Number"
            value={tracking.trackingNumber}
            onChange={(e) => setTracking((p) => ({ ...p, trackingNumber: e.target.value }))}
            className="w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-xl text-sm focus:outline-none focus:border-brand-gold"
          />
          <Button
            onClick={async () => {
              await onCreateShipment(orderId, tracking);
              setTracking({ carrier: '', trackingNumber: '' });
            }}
            disabled={isUpdating || !tracking.carrier || !tracking.trackingNumber}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white order-toolbar-btn"
          >
            <Truck size={18} className="mr-2" />
            Mark as Shipped
          </Button>
        </div>
        {/* Allow cancellation even in processing */}
        <div className="pt-2">
          {CancelBtn}
        </div>
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelConfirm}
          isUpdating={isUpdating}
        />
      </div>
    );
  }

  if (status === 'shipped') {
    return (
      <Button
        onClick={() => onUpdateStatus(orderId, 'out_for_delivery', 'Order is out for delivery')}
        disabled={isUpdating}
        className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all font-bold text-[10px] uppercase tracking-widest order-toolbar-btn"
      >
        <Truck size={18} className="mr-2" />
        Mark as Out for Delivery
      </Button>
    );
  }
  if (status === 'out_for_delivery') {
    return (
      <Button
        onClick={() => onUpdateStatus(orderId, 'delivered', 'Order delivered')}
        disabled={isUpdating}
        className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all font-bold text-[10px] uppercase tracking-widest order-toolbar-btn"
      >
        <CheckCircle size={18} className="mr-2" />
        Mark as Delivered
      </Button>
    );
  }

  if (status === 'delivered') {
    return (
      <div className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100">
        <CheckCircle size={18} className="mr-2" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Delivered</p>
      </div>
    );
  }

  if (status === 'return_requested' || status === 'refund_requested') {
    return (
      <>
        <Button
          onClick={() => setShowReviewModal(true)}
          disabled={isUpdating}
          className="w-full h-12 rounded-2xl bg-brand-dark hover:bg-brand-gold text-white shadow-lg shadow-brand-dark/20 transition-all font-bold text-[10px] uppercase tracking-widest order-toolbar-btn"
        >
          <Eye size={18} className="mr-2" />
          {status === 'return_requested' ? 'View Return Request' : 'View Refund Request'}
        </Button>
        {status === 'refund_requested' ? (
          <RefundReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            orderId={orderId}
            onUpdateStatus={onUpdateStatus}
          />
        ) : (
          <ReturnReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            orderId={orderId}
            onSuccess={onSuccess ?? (async () => { setShowReviewModal(false); })}
          />
        )}
      </>
    );
  }

  if (status === 'return_approved') {
    return (
      <>
        <Button
          onClick={() => setShowReviewModal(true)}
          disabled={isUpdating}
          className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all font-bold text-[10px] uppercase tracking-widest order-toolbar-btn"
        >
          <Eye size={18} className="mr-2" />
          View Return Details
        </Button>
        <ReturnReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          orderId={orderId}
          onSuccess={onSuccess ?? (async () => { setShowReviewModal(false); })}
        />
      </>
    );
  }

  if (status === 'courier_submitted') {
    return (
      <>
        <div className="space-y-3">
          <Button
            onClick={() => setShowReviewModal(true)}
            disabled={isUpdating}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all font-bold text-[10px] uppercase tracking-widest order-toolbar-btn"
          >
            <Eye size={18} className="mr-2" />
            View Courier Details
          </Button>
          <Button
            onClick={() => onUpdateStatus(orderId, 'returned', 'Return received and confirmed by admin')}
            disabled={isUpdating}
            className="w-full h-12 rounded-2xl bg-brand-dark hover:bg-brand-gold text-white shadow-lg shadow-brand-dark/20 transition-all font-bold text-[10px] uppercase tracking-widest order-toolbar-btn"
          >
            <Truck size={18} className="mr-2" />
            Mark as Returned
          </Button>
        </div>
        <ReturnReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          orderId={orderId}
          onSuccess={onSuccess ?? (async () => { setShowReviewModal(false); })}
        />
      </>
    );
  }

  return null;
};

export default OrderActionButtons;
