import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle, XCircle, Image as ImageIcon, CreditCard, Calendar, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

interface RefundReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onUpdateStatus: (id: string, status: string, comment: string) => void | Promise<void>;
}

const RefundReviewModal: React.FC<RefundReviewModalProps> = ({ isOpen, onClose, orderId, onUpdateStatus }) => {
  const [refundData, setRefundData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchRefundData();
    }
  }, [isOpen, orderId]);

  const fetchRefundData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/orders/${orderId}/refund`);
      setRefundData(res.data);
    } catch (error) {
      console.error('Error fetching refund data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (approve: boolean) => {
    if (!approve) {
      const reason = window.prompt('Please provide a reason for rejection:');
      if (!reason) return;
      
      setIsProcessing(true);
      try {
        await onUpdateStatus(orderId, 'delivered', `Refund Rejected: ${reason}`);
        onClose();
      } finally {
        setIsProcessing(false);
      }
    } else {
      if (!window.confirm('Are you sure you want to approve this refund? This will mark the order as Refunded.')) return;
      
      setIsProcessing(true);
      try {
        await onUpdateStatus(orderId, 'refunded', 'Refund Approved by Admin');
        onClose();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-brand-dark/5 flex items-center justify-between bg-brand-cream/10">
            <div>
              <h2 className="text-2xl font-serif text-brand-dark">Review Refund Request</h2>
              <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mt-1">Audit & Decision Panel</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-brand-dark/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-gold" />
                <p className="text-sm font-medium text-brand-dark/40 italic">Fetching request details...</p>
              </div>
            ) : refundData ? (
              <>
                {/* Reason Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-brand-gold">
                    <FileText size={18} />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Reason for Refund</h3>
                  </div>
                  <div className="p-4 bg-brand-cream/20 rounded-2xl border border-brand-dark/5">
                    <p className="text-brand-dark/80 text-sm leading-relaxed">{refundData.reason}</p>
                  </div>
                </div>

                {/* Refund Method & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-brand-gold">
                      <CreditCard size={18} />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Refund Method</h3>
                    </div>
                    <div className="p-4 bg-brand-cream/20 rounded-2xl border border-brand-dark/5">
                      <p className="text-brand-dark/80 text-sm font-bold uppercase">{refundData.refundMethod?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-brand-gold">
                      <Calendar size={18} />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Requested At</h3>
                    </div>
                    <div className="p-4 bg-brand-cream/20 rounded-2xl border border-brand-dark/5">
                      <p className="text-brand-dark/80 text-sm">
                        {new Date(refundData.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Proof Images */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-brand-gold">
                    <ImageIcon size={18} />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Proof Photos</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(() => {
                      try {
                        const images = typeof refundData.proofImages === 'string' ? JSON.parse(refundData.proofImages) : refundData.proofImages;
                        if (!images || images.length === 0) return <p className="text-xs text-brand-dark/40 italic col-span-3">No photos provided</p>;
                        return images.map((img: string, idx: number) => (
                          <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-brand-dark/5 hover:border-brand-gold transition-all">
                            <img src={img} alt={`Proof ${idx}`} className="w-full h-full object-cover" />
                          </a>
                        ));
                      } catch {
                        return <p className="text-xs text-brand-dark/40 italic">Error loading images</p>;
                      }
                    })()}
                  </div>
                </div>

                {/* Payment Proof */}
                {refundData.paymentProof && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-brand-gold">
                      <CreditCard size={18} />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Payment Screenshot</h3>
                    </div>
                    <a href={refundData.paymentProof} target="_blank" rel="noopener noreferrer" className="block max-w-xs rounded-2xl overflow-hidden border border-brand-dark/5 hover:border-brand-gold transition-all">
                      <img src={refundData.paymentProof} alt="Payment Proof" className="w-full h-auto" />
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-brand-dark/40">Request data not found.</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-8 bg-brand-cream/10 border-t border-brand-dark/5 flex gap-4">
            <Button
              onClick={() => handleAction(true)}
              disabled={isProcessing || !refundData}
              className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 font-bold uppercase tracking-widest text-xs"
            >
              <CheckCircle size={20} className="mr-2" />
              Approve Refund
            </Button>
            <Button
              onClick={() => handleAction(false)}
              disabled={isProcessing || !refundData}
              variant="outline"
              className="flex-1 h-14 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-widest text-xs"
            >
              <XCircle size={20} className="mr-2" />
              Reject Refund
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default RefundReviewModal;
