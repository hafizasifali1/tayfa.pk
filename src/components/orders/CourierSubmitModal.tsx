import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Truck, Upload, Hash, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CourierSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { courierId: string; courierSlip: string }) => Promise<void>;
  orderNumber: string;
}

const CourierSubmitModal: React.FC<CourierSubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  orderNumber,
}) => {
  const [courierId, setCourierId] = useState('');
  const [courierSlip, setCourierSlip] = useState<string>('');
  const [slipFileName, setSlipFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, WEBP, or PDF files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setError('');
    setSlipFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setCourierSlip(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!courierId.trim()) {
      setError('Please enter the courier tracking ID.');
      return;
    }
    if (!courierSlip) {
      setError('Please upload the courier slip.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({ courierId: courierId.trim(), courierSlip });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-brand-cream/10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Truck size={20} />
              </div>
              <h2 className="text-2xl font-serif text-brand-dark">Submit Courier Details</h2>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mt-2 ml-13">
              Order {orderNumber} — Return Approved
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
        <div className="p-8 space-y-6">
          <p className="text-sm text-brand-dark/60 leading-relaxed bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            Your return has been <span className="font-bold text-emerald-700">approved</span>. Please ship the item back and provide the courier tracking details below.
          </p>

          {/* Courier ID */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40">
              Courier Tracking ID
            </label>
            <div className="relative">
              <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" />
              <input
                type="text"
                value={courierId}
                onChange={(e) => setCourierId(e.target.value)}
                placeholder="e.g. TCS-123456789"
                className="w-full pl-10 pr-4 py-4 bg-brand-cream/10 border-2 border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:border-brand-gold transition-all"
              />
            </div>
          </div>

          {/* Courier Slip Upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40">
              Courier Slip
            </label>
            <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-brand-dark/10 rounded-2xl cursor-pointer hover:border-brand-gold/50 hover:bg-brand-cream/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <Upload size={20} />
              </div>
              {slipFileName ? (
                <div className="text-center">
                  <p className="text-sm font-bold text-brand-dark">{slipFileName}</p>
                  <p className="text-[10px] text-brand-dark/40 mt-0.5 uppercase tracking-widest">Tap to replace</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-bold text-brand-dark">Upload Courier Slip</p>
                  <p className="text-[10px] text-brand-dark/40 mt-0.5 uppercase tracking-widest">JPG, PNG, WEBP or PDF · Max 5MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleSlipChange}
                className="hidden"
              />
            </label>

            {courierSlip && courierSlip.startsWith('data:image/') && (
              <div className="rounded-2xl overflow-hidden border-2 border-brand-dark/5 max-h-40">
                <img src={courierSlip} alt="Courier slip preview" className="w-full object-contain max-h-40" />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-brand-dark/5 bg-brand-cream/5">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Truck size={18} />
            {isSubmitting ? 'Submitting...' : 'Submit Courier Details'}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
};

export default CourierSubmitModal;
