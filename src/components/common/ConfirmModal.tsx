import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl z-10 border border-white/10"
          >
            {/* Top Pattern/Design */}
            <div className={`h-2 ${variant === 'danger' ? 'bg-rose-500' : 'bg-brand-gold'}`} />
            
            <div className="p-8 sm:p-10 text-center">
              {/* Icon Badge */}
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ${
                variant === 'danger' ? 'bg-rose-50' : 'bg-brand-gold/5'
              }`}>
                <AlertTriangle 
                  size={32} 
                  className={variant === 'danger' ? 'text-rose-500' : 'text-brand-gold'} 
                />
              </div>

              {/* Text Content */}
              <h3 className="text-2xl font-serif text-brand-dark mb-4 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-brand-dark/60 leading-relaxed font-sans px-2">
                {message}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={variant}
                  fullWidth
                  onClick={onConfirm}
                  loading={isLoading}
                >
                  {confirmText}
                </Button>
              </div>
            </div>

            {/* Close Accent */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-brand-dark/20 hover:text-brand-dark transition-colors rounded-full hover:bg-brand-cream/50"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
