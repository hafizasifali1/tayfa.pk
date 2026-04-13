import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const PortalNotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-brand-dark/5 shadow-xl text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-8">
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-3xl font-serif text-brand-dark mb-4">Module Not Found</h2>
        <p className="text-brand-dark/60 mb-8">The module you are looking for does not exist or has been moved.</p>
        <Link 
          to=".."
          className="w-full py-4 bg-brand-dark text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center justify-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </Link>
      </div>
    </div>
  );
};

export default PortalNotFound;
