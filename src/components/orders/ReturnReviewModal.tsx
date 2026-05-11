import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, XCircle, Download, Clock, CreditCard, RotateCcw, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import Price from '../common/Price';

interface ReturnReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onUpdateStatus: (id: string, status: string, comment: string) => Promise<void>;
}

const ReturnReviewModal: React.FC<ReturnReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onUpdateStatus,
}) => {
  const [requestData, setRequestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchReturnRequest();
    }
  }, [isOpen, orderId]);

  const fetchReturnRequest = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/orders/${orderId}/return`);
      setRequestData(res.data);
    } catch (error) {
      console.error('Error fetching return request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !adminNote) {
      alert('Please provide a reason for rejection in the admin note.');
      return;
    }

    try {
      setIsProcessing(true);
      await axios.patch(`/api/returns/${requestData.id}`, {
        status,
        adminNote,
        adminId: 'admin' // In real app, get from auth
      });
      
      // Update parent state
      await onUpdateStatus(orderId, status === 'approved' ? 'returned' : 'delivered', `Return ${status}: ${adminNote}`);
      onClose();
    } catch (error) {
      console.error('Error processing return decision:', error);
      alert('Failed to process decision.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-brand-cream/10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <RotateCcw size={20} />
              </div>
              <h2 className="text-3xl font-serif text-brand-dark">Review Return Request</h2>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mt-2 ml-13">
              Audit & Decision Panel • Order ID: {orderId}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white border border-brand-dark/5 flex items-center justify-center text-brand-dark/40 hover:bg-brand-dark hover:text-white transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Loading request data...</p>
            </div>
          ) : requestData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Info */}
              <div className="lg:col-span-7 space-y-8">
                {/* Reason Section */}
                <div className="p-8 bg-brand-cream/20 rounded-[2rem] border border-brand-dark/5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-4">Reason for Return</h3>
                  <p className="text-lg text-brand-dark font-medium leading-relaxed">
                    {requestData.reason}
                  </p>
                  {requestData.comments && (
                    <div className="mt-4 pt-4 border-t border-brand-dark/5">
                      <p className="text-sm text-brand-dark/60 italic leading-relaxed">
                        "{requestData.comments}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white border border-brand-dark/5 rounded-[1.5rem]">
                    <div className="flex items-center gap-3 mb-2">
                      <RotateCcw size={16} className="text-brand-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Return Method</span>
                    </div>
                    <p className="font-bold text-brand-dark">{requestData.returnMethod}</p>
                  </div>
                  <div className="p-6 bg-white border border-brand-dark/5 rounded-[1.5rem]">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock size={16} className="text-brand-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Requested At</span>
                    </div>
                    <p className="font-bold text-brand-dark">
                      {new Date(requestData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Admin Decision Note */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 ml-2">Internal Admin Note / Feedback</h3>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Provide context for approval or reason for rejection (required for rejection)..."
                    className="w-full h-32 p-6 bg-brand-cream/10 border-2 border-brand-dark/5 rounded-[2rem] text-sm focus:outline-none focus:border-brand-gold transition-all resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Visual Proof */}
              <div className="lg:col-span-5 space-y-8">
                {/* Proof Photos */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 mb-4 ml-2">Proof Photos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {JSON.parse(requestData.proofImages || '[]').map((img: string, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-brand-dark/5 group">
                        <img src={img} alt="Proof" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <button className="p-2 bg-white rounded-full text-brand-dark shadow-xl">
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Screenshot */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 mb-4 ml-2">Payment Screenshot</h3>
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-brand-dark/5 shadow-inner">
                    {requestData.paymentProof ? (
                      <img src={requestData.paymentProof} alt="Payment Proof" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-cream/50 flex flex-col items-center justify-center text-brand-dark/20">
                        <AlertCircle size={32} />
                        <p className="text-[10px] font-bold mt-2">No Proof Provided</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center">
              <p className="text-brand-dark/40">No request found for this order.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-brand-dark/5 bg-brand-cream/5 flex gap-4">
          <button
            onClick={() => handleDecision('approved')}
            disabled={isProcessing || !requestData}
            className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <CheckCircle2 size={18} />
            {isProcessing ? 'Processing...' : 'Approve Return'}
          </button>
          <button
            onClick={() => handleDecision('rejected')}
            disabled={isProcessing || !requestData}
            className="flex-1 h-14 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <XCircle size={18} />
            Reject Return Request
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ReturnReviewModal;
