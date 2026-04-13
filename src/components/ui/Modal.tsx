import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon | React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  variant = 'default',
  size = 'md',
}: ModalProps) => {
  const variants = {
    default: 'text-brand-gold bg-brand-cream/50',
    danger: 'text-rose-500 bg-rose-50',
    success: 'text-emerald-500 bg-emerald-50',
  };

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && '$$typeof' in (Icon as any))) {
      const IconComponent = Icon as any;
      return <IconComponent size={28} />;
    }
    return Icon;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`bg-white rounded-[3rem] p-10 ${sizes[size]} w-full shadow-2xl relative overflow-hidden`}
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-2 text-brand-dark/20 hover:text-brand-dark transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center space-x-6 mb-10">
              {Icon && (
                <div className={`p-4 rounded-2xl ${variants[variant]}`}>
                  {renderIcon()}
                </div>
              )}
              <div>
                <h3 className="text-3xl font-serif text-brand-dark">{title}</h3>
                {subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mt-1">{subtitle}</p>}
              </div>
            </div>

            <div className="mb-10">
              {children}
            </div>

            {footer && (
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-brand-dark/5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// export default Modal;
