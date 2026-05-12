import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, AlertCircle, Camera, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const REFUND_REASONS = [
  'Item not received',
  'Wrong item delivered',
  'Damaged item',
  'Other',
];

const REFUND_METHODS = [
  'Return to original account',
  'Store credit',
];

interface ConfirmationFile {
  name: string;
  base64: string;
  type: string;
}

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  paymentMethod: string;
  orderNumber: string;
}

const RefundRequestModal: React.FC<RefundRequestModalProps> = ({
  isOpen, onClose, onSubmit, paymentMethod, orderNumber
}) => {
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('');
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [confirmationReceipt, setConfirmationReceipt] = useState<ConfirmationFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const proofRef = useRef<HTMLInputElement>(null);
  const paymentRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLInputElement>(null);

  const isOnline = paymentMethod !== 'cod';
  const isValid = !!reason && !!refundMethod && proofImages.length > 0 && !!paymentProof && !!confirmationReceipt;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'proof' | 'payment') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (target === 'proof') setProofImages(prev => [...prev, reader.result as string]);
      else setPaymentProof(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setConfirmationReceipt({ name: file.name, base64: reader.result as string, type: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        reason,
        refundMethod,
        proofImages,
        paymentProof,
        confirmationReceipt: confirmationReceipt?.base64 ?? null,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setRefundMethod('');
    setProofImages([]);
    setPaymentProof(null);
    setConfirmationReceipt(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-8 pb-0">
            <div>
              <h2 className="text-2xl font-serif">Refund Request</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                Order {orderNumber}
              </p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-6">

            {/* Reason Dropdown */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Reason for Refund <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm outline-none focus:border-brand-gold"
              >
                <option value="">Select a reason...</option>
                {REFUND_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Proof Photos */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Proof / Photos (Required) <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {proofImages.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button
                      onClick={() => setProofImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => proofRef.current?.click()}
                  className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:border-brand-gold hover:text-brand-gold"
                >
                  <Upload size={20} />
                </button>
              </div>
              <input type="file" ref={proofRef} accept="image/*" onChange={e => handleFileUpload(e, 'proof')} className="hidden" />
            </div>

            {/* Payment Proof */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                {isOnline ? 'Payment Screenshot' : 'Delivery Receipt'} <span className="text-red-500">*</span>
              </label>
              {paymentProof ? (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden group border">
                  <img src={paymentProof} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={() => setPaymentProof(null)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => paymentRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-2 text-gray-400 hover:border-brand-gold hover:text-brand-gold"
                >
                  <Camera size={24} />
                  <span className="text-[10px] font-bold uppercase">Upload Proof</span>
                </button>
              )}
              <input type="file" ref={paymentRef} accept="image/*" onChange={e => handleFileUpload(e, 'payment')} className="hidden" />
            </div>

            {/* Order Confirmation Receipt */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Order Confirmation Receipt <span className="text-red-500">*</span>
              </label>
              {confirmationReceipt ? (
                <div className="relative rounded-2xl border border-gray-100 overflow-hidden group">
                  {confirmationReceipt.type.startsWith('image/') ? (
                    <img src={confirmationReceipt.base64} alt="Receipt" className="w-full max-h-36 object-cover" />
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-gray-50">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-brand-gold" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 truncate">{confirmationReceipt.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                          {confirmationReceipt.type || 'Document'}
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setConfirmationReceipt(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => receiptRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-2 text-gray-400 hover:border-brand-gold hover:text-brand-gold transition-all"
                >
                  <FileText size={24} />
                  <span className="text-[10px] font-bold uppercase">Upload Receipt</span>
                  <span className="text-[9px] text-gray-300">PDF or Screenshot</span>
                </button>
              )}
              <input type="file" ref={receiptRef} accept="*" onChange={handleReceiptChange} className="hidden" />
            </div>

            {/* Refund Method */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Refund Method <span className="text-red-500">*</span>
              </label>
              <select
                value={refundMethod}
                onChange={e => setRefundMethod(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm outline-none focus:border-brand-gold"
              >
                <option value="">Select method...</option>
                {REFUND_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="w-full py-4 bg-brand-dark text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand-gold transition-all disabled:opacity-30"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Refund Request'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RefundRequestModal;
