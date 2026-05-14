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
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-brand-gold shadow-lg shadow-brand-gold/20">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Truck size={18} />
              </div>
              <h2 className="text-xl font-serif text-white tracking-wide">Submit Courier Details</h2>
            </div>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/60 mt-2 ml-12">
              Order {orderNumber} — Approved
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-brand-gold transition-all shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-brand-dark/70 font-medium bg-brand-cream-dark/50 border border-brand-dark/5 rounded-xl p-4 text-center">
            Return approved. Please provide your courier tracking details below.
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
                className="w-full pl-10 pr-4 py-3.5 bg-brand-cream/10 border-2 border-brand-dark/5 rounded-2xl text-sm focus:outline-none focus:border-brand-gold transition-all"
              />
            </div>
          </div>

          {/* Courier Slip Upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40">
              Courier Slip
            </label>
            <label className="group relative flex flex-col items-center justify-center gap-3 p-5 border-2 border-dashed border-brand-dark/10 rounded-2xl cursor-pointer hover:border-brand-gold/50 hover:bg-brand-cream/20 transition-all min-h-[160px] overflow-hidden">
              {courierSlip && courierSlip.startsWith('data:image/') ? (
                <div className="absolute inset-0 w-full h-full p-2">
                  <img src={courierSlip} alt="Courier slip preview" className="w-full h-full object-contain rounded-xl" />
                  <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <Upload size={18} />
                    </div>
                    <p className="text-[10px] text-white font-bold uppercase tracking-widest">Tap to replace</p>
                    <p className="text-[9px] text-white/60 truncate max-w-[80%] px-4">{slipFileName}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-11 h-11 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
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
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleSlipChange}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-dark/5 bg-brand-cream-dark/30">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Truck size={16} />
            {isSubmitting ? 'Submitting...' : 'Submit Courier Details'}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
};

export default CourierSubmitModal;
