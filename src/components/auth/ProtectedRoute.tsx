import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Module, Action } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: Module;
  action?: Action;
  role?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  module, 
  action = 'view',
  role 
}) => {
  const { user, hasPermission, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (role && user.role !== role && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (module && !hasPermission(module, action)) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-brand-dark/5 shadow-xl text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-3xl font-serif text-brand-dark mb-4">Access Denied</h2>
          <p className="text-brand-dark/60 mb-8">You do not have permission to access the <span className="font-bold text-brand-dark">{module}</span> module.</p>
          <button 
            onClick={() => window.history.back()}
            className="w-full py-4 bg-brand-dark text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
