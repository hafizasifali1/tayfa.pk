import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';

interface FormModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const FormModal = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  children,
  maxWidth = 'max-w-lg'
}: FormModalProps) => {
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${maxWidth} bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10 flex flex-col`}
          >
            {/* Header: Theme Gold background with White Title */}
            <div className="bg-[var(--color-brand-gold)] px-10 py-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-serif text-white">{title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body: Scrollable Form Fields */}
            <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-10 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {children}
              </div>

              {/* Footer: Action Buttons */}
              <div className="px-10 pb-10 flex gap-4 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 border border-brand-dark/10 rounded-full font-bold uppercase tracking-widest hover:bg-brand-cream-dark transition-all disabled:opacity-50 text-[11px] text-brand-dark"
                >
                  {cancelLabel}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-3 bg-[var(--color-brand-gold)] text-white rounded-full font-bold uppercase tracking-widest hover:brightness-110 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2 text-[11px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{submitLabel}</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
