import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

const PRESET_REASONS = [
  'Changed my mind',
  'Delivery time is too long',
  'Want to change size / color / variant',
  'Payment issue',
  'Ordered wrong product',
  'Shipping cost is too high',
  'No longer needed',
  'Other',
];

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isUpdating?: boolean;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isUpdating = false,
}) => {
  const [selected, setSelected] = useState('');
  const [otherText, setOtherText] = useState('');

  const handleConfirm = () => {
    const reason = selected === 'Other' ? (otherText.trim() || 'Other') : selected;
    if (!reason) return;
    onConfirm(`Order cancelled — ${reason}`);
  };

  const isValid = selected !== '' && (selected !== 'Other' || otherText.trim() !== '');

  // Reset state when modal closes
  const handleClose = () => {
    setSelected('');
    setOtherText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-8 pt-8 pb-4 border-b border-brand-dark/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-brand-dark">Cancel Order</h2>
                    <p className="text-[11px] text-brand-dark/40 uppercase tracking-widest font-bold mt-0.5">
                      Select a reason to continue
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl bg-brand-cream/60 text-brand-dark/30 hover:text-brand-dark transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>

              {/* Reason List */}
              <div className="px-8 py-5 space-y-2 max-h-72 overflow-y-auto">
                {PRESET_REASONS.map((reason) => {
                  const isChecked = selected === reason;
                  return (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all duration-150 ${
                        isChecked
                          ? 'border-brand-gold bg-brand-gold/5 shadow-sm'
                          : 'border-brand-dark/8 hover:border-brand-dark/20 hover:bg-brand-cream/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancel-reason"
                        value={reason}
                        checked={isChecked}
                        onChange={() => {
                          setSelected(reason);
                          if (reason !== 'Other') setOtherText('');
                        }}
                        className="accent-brand-gold w-4 h-4 flex-shrink-0"
                      />
                      <span
                        className={`text-sm font-medium transition-colors ${
                          isChecked ? 'text-brand-dark' : 'text-brand-dark/60'
                        }`}
                      >
                        {reason}
                      </span>
                    </label>
                  );
                })}

                {/* "Other" textarea */}
                <AnimatePresence>
                  {selected === 'Other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <textarea
                        value={otherText}
                        onChange={(e) => setOtherText(e.target.value)}
                        placeholder="Please describe your reason..."
                        rows={3}
                        className="w-full mt-2 px-4 py-3 bg-brand-cream/30 border border-brand-dark/10 rounded-xl text-sm text-brand-dark placeholder-brand-dark/30 focus:outline-none focus:border-brand-gold resize-none transition-all"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-8 pb-8 pt-4 border-t border-brand-dark/5 flex gap-3">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 rounded-xl border-brand-dark/10 text-brand-dark/60 hover:bg-brand-cream/40"
                  disabled={isUpdating}
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!isValid || isUpdating}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isUpdating ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CancelOrderModal;
