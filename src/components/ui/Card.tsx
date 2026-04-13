import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon | React.ReactNode;
  variant?: 'default' | 'premium' | 'technical' | 'minimal';
  className?: string;
  delay?: number;
  hover?: boolean;
  onClick?: () => void;
  animationDelay?: number;
}

export const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  variant = 'default',
  className = '',
  delay = 0,
  hover = true,
  onClick,
  animationDelay,
}: CardProps) => {
  const variants = {
    default: 'card-premium',
    premium: 'card-premium bg-gradient-to-br from-white to-brand-cream/50',
    technical: 'bg-brand-cream/20 p-6 rounded-3xl border border-brand-dark/5 hover:border-brand-gold/20 transition-all',
    minimal: 'bg-white p-4 rounded-2xl border border-brand-dark/5 shadow-sm',
  };

  const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  const cursorStyles = onClick ? 'cursor-pointer' : '';

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && '$$typeof' in (Icon as any))) {
      const IconComponent = Icon as any;
      return <IconComponent size={20} />;
    }
    return Icon;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || animationDelay }}
      className={`${variants[variant]} ${hoverStyles} ${cursorStyles} ${className}`}
      onClick={onClick}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h3 className="text-xl font-serif text-brand-dark">{title}</h3>}
            {subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="p-3 bg-brand-cream/50 rounded-2xl text-brand-gold">
              {renderIcon()}
            </div>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
};

// export default Card;
