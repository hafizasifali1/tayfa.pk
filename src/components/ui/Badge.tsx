import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'default';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
  icon?: React.ElementType;
}

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  onClick,
  icon: Icon,
}: BadgeProps) => {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    danger: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    warning: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    neutral: 'bg-brand-cream text-brand-dark/40 border-brand-dark/10',
    default: 'bg-brand-cream text-brand-dark/40 border-brand-dark/10',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[8px]',
    md: 'badge-premium',
  };

  return (
    <span 
      className={`inline-flex items-center font-bold uppercase tracking-widest rounded-full border ${variants[variant]} ${sizes[size]} ${className} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      {Icon && <Icon size={size === 'sm' ? 8 : 10} className="mr-1" />}
      {children}
    </span>
  );
};

// export default Badge;
