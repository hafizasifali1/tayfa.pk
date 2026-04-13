import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon | React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  fullWidth,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-brand-dark text-white hover:bg-brand-gold shadow-lg shadow-brand-dark/10 hover:shadow-brand-gold/20',
    secondary: 'bg-white text-brand-dark border border-brand-dark/10 hover:bg-brand-cream-dark',
    outline: 'border border-brand-dark/20 text-brand-dark hover:bg-brand-dark hover:text-white',
    ghost: 'text-brand-dark/60 hover:text-brand-dark hover:bg-brand-cream/50',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20',
    premium: 'bg-brand-dark text-white hover:bg-brand-gold shadow-xl hover:shadow-brand-gold/30',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[9px] rounded-xl',
    md: 'px-6 py-3 text-[10px] rounded-2xl',
    lg: 'px-8 py-4 text-xs rounded-[1.5rem]',
    icon: 'p-3 rounded-xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && '$$typeof' in (Icon as any))) {
      const IconComponent = Icon as any;
      return <IconComponent size={size === 'sm' ? 14 : 18} className={children ? 'mr-2' : ''} />;
    }
    return <span className={children ? 'mr-2' : ''}>{Icon as any}</span>;
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : renderIcon()}
      {children}
    </motion.button>
  );
};

// export default Button;
