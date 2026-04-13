import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import { Mail, Lock, Eye, EyeOff, Chrome, Apple, ShieldCheck, Store, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'user' | 'seller' | 'admin'>('user');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { user, login, socialLogin, isAuthReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthReady && user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    }
  }, [user, isAuthReady, navigate]);

  useEffect(() => {
    const lastRole = localStorage.getItem('tayfa_last_role');
    if (lastRole === 'user' || lastRole === 'seller' || lastRole === 'admin') {
      setRole(lastRole);
    }
    
    const savedEmail = localStorage.getItem('tayfa_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, role);
      
      if (rememberMe) {
        localStorage.setItem('tayfa_remember_email', email);
      } else {
        localStorage.removeItem('tayfa_remember_email');
      }

      // Auto-redirect based on role
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials for this role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      await socialLogin(provider, role);
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError('Social login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'user', label: 'Customer', icon: UserIcon },
    { id: 'seller', label: 'Seller', icon: Store },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your TAYFA account to continue your fashion journey."
    >
      <div className="mb-8">
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 mb-4 text-center">
          Select Your Role
        </label>
        <div className="flex p-1.5 bg-brand-cream/50 rounded-2xl border border-brand-dark/5">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all relative ${
                role === r.id 
                  ? 'text-brand-dark font-bold' 
                  : 'text-brand-dark/40 hover:text-brand-dark/60'
              }`}
            >
              {role === r.id && (
                <motion.div 
                  layoutId="active-role"
                  className="absolute inset-0 bg-white shadow-sm rounded-xl border border-brand-dark/5"
                />
              )}
              <r.icon size={16} className="relative z-10" />
              <span className="text-[11px] uppercase tracking-widest relative z-10">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.form 
          key={role}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
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

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">
                Password
              </label>
              <Link to="/forgot-password" title="Forgot password?" className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/80 transition-colors">
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
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

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-all duration-300 ${rememberMe ? 'bg-brand-gold' : 'bg-brand-dark/10'}`} />
                <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 transform ${rememberMe ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="ml-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/40 group-hover:text-brand-dark/60 transition-colors">
                Remember Me
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-brand-dark/5 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-brand-dark hover:bg-brand-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:opacity-50 transition-all group"
          >
            <span>{isLoading ? 'Authenticating...' : `Sign In as ${role}`}</span>
            {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </motion.form>
      </AnimatePresence>

      {role !== 'admin' && (
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-dark/5" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-white text-brand-dark/30 uppercase tracking-[0.3em] font-bold">
                Secure Social Access
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 border border-brand-dark/5 rounded-2xl bg-brand-cream/20 text-[11px] font-bold uppercase tracking-widest text-brand-dark hover:bg-white hover:shadow-lg hover:border-brand-gold/20 transition-all group"
            >
              <Chrome size={18} className="text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Google</span>
            </button>
            <button 
              onClick={() => handleSocialLogin('apple')}
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 border border-brand-dark/5 rounded-2xl bg-brand-cream/20 text-[11px] font-bold uppercase tracking-widest text-brand-dark hover:bg-white hover:shadow-lg hover:border-brand-gold/20 transition-all group"
            >
              <Apple size={18} className="text-brand-dark group-hover:scale-110 transition-transform" />
              <span>Apple</span>
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 text-center space-y-4">
        <p className="text-[11px] text-brand-dark/40 uppercase tracking-widest font-medium">
          New to the platform?{' '}
          <Link to="/signup" className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">
            Create Account
          </Link>
        </p>
        {role !== 'seller' && (
          <p className="text-[11px] text-brand-dark/40 uppercase tracking-widest font-medium">
            Want to showcase your brand?{' '}
            <Link to="/seller/register" className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">
              Join as Seller
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
};

export default SignIn;
