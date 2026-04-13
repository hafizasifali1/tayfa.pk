import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout 
        title="Check Your Email" 
        subtitle="We've sent a password reset link to your email address."
      >
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-brand-dark/60">
              We've sent an email to <span className="font-bold text-brand-dark">{email}</span> with instructions to reset your password.
            </p>
            <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">
              Didn't receive it? Check your spam folder.
            </p>
          </div>

          <div className="pt-4">
            <Link 
              to="/signin"
              className="inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/80 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Forgot Password" 
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
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
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
            </div>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-brand-dark/5 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-brand-dark hover:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-50 transition-all group"
        >
          <span>{isLoading ? 'Sending Link...' : 'Send Reset Link'}</span>
          {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
        </button>

        <div className="text-center pt-4">
          <Link 
            to="/signin"
            className="inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark/60 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
