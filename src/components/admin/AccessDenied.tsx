import React from 'react';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface AccessDeniedProps {
  requiredRole?: string;
}

const AccessDenied = ({ requiredRole = 'admin' }: AccessDeniedProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[2.5rem] flex items-center justify-center mb-8 animate-pulse">
        <ShieldAlert size={48} />
      </div>
      
      <h1 className="text-5xl font-serif mb-4 tracking-tight">Access Restricted</h1>
      <p className="text-brand-dark/60 max-w-md mb-12 leading-relaxed">
        Your current account level does not have the required <span className="font-bold text-brand-dark uppercase tracking-widest text-[10px] bg-brand-dark/5 px-2 py-1 rounded-md">{requiredRole}</span> permissions to access this protocol.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Link to="/">
          <Button 
            variant="primary" 
            icon={Home}
          >
            Return Home
          </Button>
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-brand-dark/5 w-full max-w-xs">
        <p className="text-[9px] font-mono text-brand-dark/20 uppercase tracking-[0.3em]">Error_Code: 403_FORBIDDEN_ACCESS</p>
      </div>
    </div>
  );
};

export default AccessDenied;
