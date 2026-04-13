import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const strength = getStrength(password);
  
  const getLabel = (s: number) => {
    if (s === 0) return 'Very Weak';
    if (s === 1) return 'Weak';
    if (s === 2) return 'Medium';
    if (s === 3) return 'Strong';
    return 'Very Strong';
  };

  const getColor = (s: number) => {
    if (s === 0) return 'bg-gray-200';
    if (s === 1) return 'bg-rose-500';
    if (s === 2) return 'bg-amber-500';
    if (s === 3) return 'bg-emerald-500';
    return 'bg-emerald-600';
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Password Strength</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${
          strength <= 1 ? 'text-rose-500' : strength === 2 ? 'text-amber-500' : 'text-emerald-500'
        }`}>
          {getLabel(strength)}
        </span>
      </div>
      <div className="flex space-x-1 h-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-500 ${
              i <= strength ? getColor(strength) : 'bg-gray-100'
            }`}
          />
        ))}
      </div>
      <p className="text-[9px] text-brand-dark/30 mt-1 font-medium">
        Use 8+ characters with a mix of letters, numbers & symbols.
      </p>
    </div>
  );
};

export default PasswordStrength;
