import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout 
        title="Password Reset" 
        subtitle="Your password has been successfully updated."
      >
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-brand-dark/60">
              Your password has been reset successfully. You can now use your new password to sign in to your account.
            </p>
            <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">
              Redirecting to sign in page...
            </p>
          </div>

          <div className="pt-4">
            <Link 
              to="/signin"
              className="inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/80 transition-colors"
            >
              <span>Sign In Now</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Create a new secure password for your account."
    >
      {!token ? (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
              <ShieldAlert size={32} className="text-rose-500" />
            </div>
          </div>
          <p className="text-sm text-brand-dark/60">{error}</p>
          <Link 
            to="/forgot-password"
            className="inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/80 transition-colors"
          >
            <span>Request New Link</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-[11px] font-medium flex items-center space-x-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>{error}</span>
            </motion.div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2 ml-1">
              New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 bg-brand-cream/20 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-dark/20 hover:text-brand-gold transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2 ml-1">
              Confirm New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 bg-brand-cream/20 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-brand-dark/5 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-brand-dark hover:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-50 transition-all group"
          >
            <span>{isLoading ? 'Resetting Password...' : 'Reset Password'}</span>
            {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
