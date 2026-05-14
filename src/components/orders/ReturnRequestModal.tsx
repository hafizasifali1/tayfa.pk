import React, { useState, useRef } from 'react';
import { X, Upload, AlertCircle, Trash2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Price from '../common/Price';

const RETURN_METHODS = ['Pick up from address', 'Drop off at store'];

interface OrderItem {
  id: string;
  name: string;
  size?: string;
  quantity: number;
  price: string | number;
}

interface ReceiptFile {
  name: string;
  base64: string;
  type: string;
}

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    order_item_id: string;
    proof_images: string[];
    return_method: string;
    receipt_file: string;
  }) => Promise<void>;
  items: OrderItem[];
  orderNumber: string;
}

const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  items,
  orderNumber,
}) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [returnMethod, setReturnMethod] = useState('');
  const [proofImages, setProofImages] = useState<{ preview: string; base64: string }[]>([]);
  const [receipt, setReceipt] = useState<ReceiptFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const proofRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLInputElement>(null);

  const isValid = selectedItemId !== '' && proofImages.length > 0 && receipt !== null;

  const handleProofChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const processed = await Promise.all(
      files.slice(0, 5 - proofImages.length).map(
        file =>
          new Promise<{ preview: string; base64: string }>(resolve => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ preview: URL.createObjectURL(file), base64: reader.result as string });
            reader.readAsDataURL(file);
          })
      )
    );
    setProofImages(prev => [...prev, ...processed].slice(0, 5));
    e.target.value = '';
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReceipt({ name: file.name, base64: reader.result as string, type: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    const errs: string[] = [];
    if (!selectedItemId) errs.push('Please select an item to return.');
    // if (!returnMethod) errs.push('Please select a return method.');
    if (proofImages.length === 0) errs.push('Please upload at least one proof photo.');
    if (!receipt) errs.push('Please upload your receipt or proof of purchase.');

    if (errs.length > 0) { setErrors(errs); return; }

    setErrors([]);
    setIsSubmitting(true);
    try {
      await onSubmit({
        order_item_id: selectedItemId,
        proof_images: proofImages.map(i => i.base64),
        return_method: returnMethod,
        receipt_file: receipt!.base64,
      });
      handleClose();
    } catch {
      setErrors(['Submission failed. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedItemId('');
    setReturnMethod('');
    setProofImages([]);
    setReceipt(null);
    setErrors([]);
    onClose();
  };

  const isImageType = (type: string) => type.startsWith('image/');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-4xl w-full max-w-xl shadow-2xl flex flex-col"
            style={{ maxHeight: '92vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-brand-dark/5 shrink-0">
              <div>
                <h2 className="text-2xl font-serif text-brand-dark">Request Return</h2>
                <p className="text-[10px] text-brand-dark/40 mt-1 uppercase tracking-widest font-bold">
                  Order {orderNumber}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark/60 hover:bg-brand-gold hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-7">

              {/* Errors */}
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

              {/* 1. Item Selection */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50">
                  Select Item to Return <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {items.map(item => {
                    const selected = selectedItemId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItemId(item.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                          selected
                            ? 'border-brand-gold bg-brand-gold/5'
                            : 'border-brand-dark/5 bg-brand-cream/20 hover:border-brand-dark/15'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          selected ? 'bg-brand-gold border-brand-gold' : 'border-brand-dark/20 bg-white'
                        }`}>
                          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-brand-dark text-sm truncate">{item.name}</p>
                          <p className="text-[10px] text-brand-dark/40 mt-0.5 uppercase tracking-widest">
                            {[item.size && `Size ${item.size}`, `Qty: ${item.quantity}`].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <div className="font-bold text-brand-dark text-sm shrink-0">
                          <Price amount={Number(item.price)} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Return Method */}
              {/* <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50">
                  Return Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {RETURN_METHODS.map(m => (
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
              </div> */}

              {/* 3. Item Proof Photos */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50">
                  Item Proof Photos <span className="text-red-500">*</span>
                </label>
                {proofImages.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {proofImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-brand-gold/20 group shrink-0">
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProofImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-brand-dark/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {proofImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => proofRef.current?.click()}
                    className="w-full border-2 border-dashed border-brand-dark/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-brand-gold/40 hover:bg-brand-gold/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark/30 group-hover:bg-brand-gold group-hover:text-white transition-all">
                      <Upload size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-brand-dark/60 uppercase tracking-widest">Upload photos</p>
                      <p className="text-[10px] text-brand-dark/30 mt-1">JPG, PNG, WEBP — up to 5 photos</p>
                    </div>
                  </button>
                )}
                <input ref={proofRef} type="file" multiple accept="image/*" onChange={handleProofChange} className="hidden" />
              </div>

              {/* 4. Receipt on Confirmation */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-brand-dark/50">
                  Receipt / Proof of Purchase <span className="text-red-500">*</span>
                </label>

                {receipt ? (
                  <div className="relative rounded-2xl border-2 border-brand-gold/20 overflow-hidden group">
                    {isImageType(receipt.type) ? (
                      <img src={receipt.base64} alt="Receipt" className="w-full max-h-48 object-cover" />
                    ) : (
                      <div className="flex items-center gap-4 p-5 bg-brand-cream/30">
                        <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center shrink-0">
                          <FileText size={22} className="text-brand-gold" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-brand-dark truncate">{receipt.name}</p>
                          <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mt-0.5">
                            {receipt.type || 'Document'}
                          </p>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setReceipt(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-brand-dark/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => receiptRef.current?.click()}
                    className="w-full border-2 border-dashed border-brand-dark/10 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-brand-gold/40 hover:bg-brand-gold/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark/30 group-hover:bg-brand-gold group-hover:text-white transition-all">
                      <FileText size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-brand-dark/60 uppercase tracking-widest">Upload Receipt</p>
                      <p className="text-[10px] text-brand-dark/30 mt-1">Screenshot, PDF, or any file</p>
                    </div>
                  </button>
                )}
                <input ref={receiptRef} type="file" accept="*" onChange={handleReceiptChange} className="hidden" />
              </div>

            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-brand-dark/5 flex gap-3 shrink-0">
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
                className={`flex-2 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${
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
