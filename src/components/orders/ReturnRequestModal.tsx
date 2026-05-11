import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Price from '../common/Price';

const RETURN_REASONS = [
  'Wrong Size',
  'Damaged Item',
  'Not as Described',
  'Changed Mind',
  'Other',
];

interface ReturnItem {
  id: string;
  name: string;
  size?: string;
  quantity: number;
  price: string | number;
}

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    itemIds: string[];
    reason: string;
    comments: string;
    images: string[];
  }) => Promise<void>;
  items: ReturnItem[];
}

const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  items,
}) => {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [images, setImages] = useState<{ preview: string; base64: string }[]>([]);
  const [paymentProof, setPaymentProof] = useState<{ preview: string; base64: string } | null>(null);
  const [returnMethod, setReturnMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paymentProofRef = useRef<HTMLInputElement>(null);

  const isValid = selectedItemIds.length > 0 && reason !== '' && images.length > 0 && paymentProof !== null && returnMethod !== '';

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const processed = await Promise.all(
      files.slice(0, 5 - images.length).map(
        file =>
          new Promise<{ preview: string; base64: string }>(resolve => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                preview: URL.createObjectURL(file),
                base64: reader.result as string,
              });
            reader.readAsDataURL(file);
          })
      )
    );
    setImages(prev => [...prev, ...processed].slice(0, 5));
    e.target.value = '';
  };

  const handlePaymentProofChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentProof({
        preview: URL.createObjectURL(file),
        base64: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    const errs: string[] = [];
    if (selectedItemIds.length === 0) errs.push('Please select at least one item to return.');
    if (!reason) errs.push('Reason for Return is required.');
    if (images.length === 0) errs.push('Please upload at least one photo of the item(s).');
    if (!paymentProof) errs.push('Payment proof is required.');
    if (!returnMethod) errs.push('Please select a return method.');
    
    if (errs.length > 0) { setErrors(errs); return; }

    setErrors([]);
    setIsSubmitting(true);
    try {
      await onSubmit({ 
        itemIds: selectedItemIds, 
        reason, 
        comments, 
        images: images.map(i => i.base64),
        paymentProof: paymentProof.base64,
        returnMethod
      });
      handleClose();
    } catch {
      setErrors(['Submission failed. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedItemIds([]);
    setReason('');
    setComments('');
    setImages([]);
    setPaymentProof(null);
    setReturnMethod('');
    setErrors([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-[2rem] w-full max-w-xl shadow-2xl flex flex-col"
            style={{ maxHeight: '92vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-brand-dark/5 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-serif text-brand-dark">Request Return</h2>
                <p className="text-[10px] text-brand-dark/40 mt-1 uppercase tracking-widest font-bold">
                  Complete all fields below to submit your request
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark/60 hover:bg-brand-gold hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-7">

              {/* Error Banner */}
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-1.5"
                >
                  {errors.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-red-600 text-xs font-bold">
                      <AlertCircle size={13} />
                      <span>{e}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* 1. Items Selection */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50">
                  Select Items to Return <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {items.map(item => {
                    const selected = selectedItemIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                          selected
                            ? 'border-brand-gold bg-brand-gold/5'
                            : 'border-brand-dark/5 bg-brand-cream/20 hover:border-brand-dark/15'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selected ? 'bg-brand-gold border-brand-gold' : 'border-brand-dark/20 bg-white'
                        }`}>
                          {selected && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-brand-dark text-sm truncate">{item.name}</p>
                          <p className="text-[10px] text-brand-dark/40 mt-0.5 uppercase tracking-widest">
                            {[item.size && `Size ${item.size}`, `Qty: ${item.quantity}`].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <div className="font-bold text-brand-dark text-sm flex-shrink-0">
                          <Price amount={Number(item.price)} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Reason for Return */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50">
                  Reason for Return <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full bg-brand-cream/30 border-2 border-brand-dark/5 rounded-2xl px-5 py-3.5 text-sm font-medium text-brand-dark focus:outline-none focus:border-brand-gold transition-all appearance-none cursor-pointer"
                >
                  <option value="">Choose a reason...</option>
                  {RETURN_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* 3. Return Method */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50">
                  Return Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Pick up from address', 'Drop off at store'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setReturnMethod(m)}
                      className={`px-4 py-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                        returnMethod === m
                          ? 'border-brand-gold bg-brand-gold/5 text-brand-gold'
                          : 'border-brand-dark/5 bg-brand-cream/20 text-brand-dark/40 hover:border-brand-dark/15'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Payment Proof Upload */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50">
                  Payment Proof <span className="text-red-500">*</span>
                </label>
                {paymentProof ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-brand-gold/20 group">
                    <img src={paymentProof.preview} alt="Payment Proof" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPaymentProof(null)}
                      className="absolute inset-0 bg-brand-dark/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                    >
                      <Trash2 size={20} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => paymentProofRef.current?.click()}
                    className="w-full border-2 border-dashed border-brand-dark/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-brand-gold/40 hover:bg-brand-gold/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark/30 group-hover:bg-brand-gold group-hover:text-white transition-all">
                      <CreditCard size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-brand-dark/60 uppercase tracking-widest">Upload Payment Proof</p>
                      <p className="text-[10px] text-brand-dark/30 mt-1">Screenshot of payment confirmation</p>
                    </div>
                  </button>
                )}
                <input
                  ref={paymentProofRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePaymentProofChange}
                  className="hidden"
                />
              </div>

              {/* 5. Additional Comments */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50">
                  Additional Comments <span className="text-brand-dark/25 normal-case font-bold">(Optional)</span>
                </label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="Describe the issue in more detail..."
                  rows={3}
                  className="w-full bg-brand-cream/30 border-2 border-brand-dark/5 rounded-2xl px-5 py-3.5 text-sm font-medium text-brand-dark focus:outline-none focus:border-brand-gold transition-all resize-none"
                />
              </div>

              {/* 6. Photos of items */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50">
                  Item Photos <span className="text-red-500">*</span>
                </label>
                {/* ... existing photo upload UI ... */}

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-brand-gold/20 group flex-shrink-0">
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-brand-dark/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-brand-dark/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-brand-gold/40 hover:bg-brand-gold/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark/30 group-hover:bg-brand-gold group-hover:text-white transition-all">
                      <Upload size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-brand-dark/60 uppercase tracking-widest">Click to upload photos</p>
                      <p className="text-[10px] text-brand-dark/30 mt-1">JPG, PNG, WEBP — up to 5 photos</p>
                    </div>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-brand-dark/5 flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3.5 rounded-2xl border-2 border-brand-dark/10 text-[11px] font-bold uppercase tracking-widest text-brand-dark hover:bg-brand-cream transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className={`flex-[2] py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  isValid && !isSubmitting
                    ? 'bg-brand-dark text-white hover:bg-brand-gold shadow-lg hover:shadow-brand-gold/20'
                    : 'bg-brand-dark/10 text-brand-dark/30 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReturnRequestModal;
