import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import { User, Mail, Phone, Lock, Eye, EyeOff, Chrome, Apple, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PasswordStrength from '../../components/auth/PasswordStrength';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { registerUser, socialLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.terms) {
      setError('Please accept the Terms & Conditions');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(formData);
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      await socialLogin(provider, 'user');
      navigate('/');
    } catch (err: any) {
      setError('Social sign-up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Account Created" subtitle="Welcome to the TAYFA family.">
        <div className="text-center py-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={40} className="text-emerald-500" />
          </motion.div>
          <h3 className="text-xl font-serif text-brand-dark mb-2">Registration Successful</h3>
          <p className="text-sm text-brand-dark/40 mb-8">Redirecting you to your fashion feed...</p>
          <div className="w-12 h-1.5 bg-brand-cream rounded-full mx-auto overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-brand-gold"
            />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Join" 
      subtitle="Create your account to experience curated luxury fashion."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-[11px] font-medium flex items-center space-x-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-brand-dark/80 mb-2.5 ml-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              </div>
              <input
                type="text"
                name="fullName"
                required
                autoFocus
                value={formData.fullName}
                onChange={handleChange}
                className="block w-full pl-12 pr-4 py-4.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-brand-dark/80 mb-2.5 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-brand-dark/80 mb-2.5 ml-1">
              Phone (Optional)
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full pl-12 pr-4 py-4.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-brand-dark/80 mb-2.5 ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-12 pr-12 py-4.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
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
            {formData.password && <PasswordStrength password={formData.password} />}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-brand-dark/80 mb-2.5 ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full pl-12 pr-4 py-4.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={formData.terms}
              onChange={handleChange}
              className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-brand-dark/10 rounded cursor-pointer"
            />
          </div>
          <div className="ml-3 text-[11px] text-brand-dark/50 leading-relaxed uppercase tracking-widest font-bold">
            I agree to the{' '}
            <Link to="/terms" className="text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">
              Privacy Policy
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 py-4.5 px-4 border border-transparent rounded-2xl shadow-2xl shadow-brand-dark/10 text-xs font-bold uppercase tracking-[0.2em] text-white bg-brand-dark hover:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-50 transition-all group"
        >
          <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
          {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="mt-10">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-dark/5" />
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="px-5 bg-white text-brand-dark/30 uppercase tracking-[0.3em] font-bold">
              Rapid Social Sign-Up
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleSocialSignUp('google')}
            className="w-full flex items-center justify-center space-x-3 py-4 px-4 border border-brand-dark/5 rounded-2xl bg-brand-cream/5 text-xs font-bold uppercase tracking-widest text-brand-dark hover:bg-white hover:shadow-xl hover:border-brand-gold/20 transition-all group"
          >
            <Chrome size={20} className="text-rose-500 group-hover:scale-110 transition-transform" />
            <span>Google</span>
          </button>
          <button 
            onClick={() => handleSocialSignUp('apple')}
            className="w-full flex items-center justify-center space-x-3 py-4 px-4 border border-brand-dark/5 rounded-2xl bg-brand-cream/5 text-xs font-bold uppercase tracking-widest text-brand-dark hover:bg-white hover:shadow-xl hover:border-brand-gold/20 transition-all group"
          >
            <Apple size={20} className="text-brand-dark group-hover:scale-110 transition-transform" />
            <span>Apple</span>
          </button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[11px] text-brand-dark/40 uppercase tracking-widest font-medium">
          Already a member?{' '}
          <Link to="/signin" className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
