import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  multiline?: boolean;
}

const Input = ({
  label,
  icon: Icon,
  error,
  multiline,
  className = '',
  ...props
}: InputProps) => {
  const Component = multiline ? 'textarea' : 'input';
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-dark/20">
            <Icon size={18} />
          </div>
        )}
        <Component
          className={`input-premium w-full ${Icon ? 'pl-16' : ''} ${error ? 'ring-2 ring-rose-500/20' : ''}`}
          {...(props as any)}
        />
      </div>
      {error && (
        <p className="text-[10px] font-bold text-rose-500 ml-4 uppercase tracking-widest">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
