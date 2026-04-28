import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  X, Mail, Lock, Eye, EyeOff, Apple, ArrowRight, ArrowLeft,
  ShieldCheck, Store, User as UserIcon, Phone, CheckCircle2,
  Building, Globe, ChevronDown, Plus, Trash2, Info, Briefcase,
  Upload, Instagram, Facebook, Twitter,
} from 'lucide-react';
import PasswordStrength from './PasswordStrength';

// ─── Custom Social Icons ─────────────────────────────────────────────────────
const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
);
const PinterestIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8c-3 0-5 2-5 5 0 2 1 3 2 3 .3.5.7 1 1.2 1.5l.8 2.5 1-3.5c1 0 2-.5 2.5-1.5s.5-2 0-3.5S14 8 12 8z" /><line x1="12" y1="12" x2="12" y2="16" /></svg>
);

export type AuthModalTab = 'signin' | 'signup' | 'seller';

// ─── Floating particle ───────────────────────────────────────────────────────
const Particle = ({ style, duration = 6 }: { style: React.CSSProperties, duration?: number }) => (
  <motion.div
    className="absolute rounded-full shadow-lg shadow-brand-gold/10"
    animate={{ y: [0, -25, 0], opacity: [0.15, 0.35, 0.15] }}
    transition={{ duration: duration, repeat: Infinity, ease: 'easeInOut' }}
    style={{ ...style, backgroundColor: '#C9A84C' }}
  />
);

// ─── Google Button Component ─────────────────────────────────────────────────
const GoogleLoginButton = ({ onSuccess, onError, label = 'Google' }: {
  onSuccess: (token: string) => void;
  onError: () => void;
  label?: string;
}) => (
  <div className="w-full">
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse.credential) {
          onSuccess(credentialResponse.credential);
        }
      }}
      onError={onError}
      useOneTap={false}
      theme="outline"
      size="large"
      text="signin_with"
      shape="rectangular"
      width="100%"
    />
  </div>
);

// ─── Left branding panel ─────────────────────────────────────────────────────
const BrandPanel = () => {
  const particles = [
    { size: 40, top: '10%', left: '15%', duration: 7 },
    { size: 20, top: '30%', left: '80%', duration: 5 },
    { size: 60, top: '60%', left: '20%', duration: 9 },
    { size: 30, top: '85%', left: '50%', duration: 4 },
    { size: 25, top: '70%', left: '75%', duration: 6 },
  ];

  return (
    <div
      className="hidden md:flex flex-col justify-between relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg,#1a1a1a 0%,#0f0e0c 60%,#1a1510 100%)',
        padding: '32px 48px',
        width: '50%',
        flexShrink: 0,
        flexGrow: 0,
        height: '100%',
      }}
    >
      {particles.map((p, i) => (
        <Particle key={i} duration={p.duration} style={{ width: p.size, height: p.size, top: p.top, left: p.left }} />
      ))}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse 70% 50% at 20% 80%,rgba(201,168,76,.06) 0%,transparent 70%),radial-gradient(ellipse 50% 40% at 80% 20%,rgba(201,168,76,.04) 0%,transparent 60%)' }} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative z-10 flex flex-col items-center mt-4">
        <Link to="/">
          <div style={{ width: 180, height: 56, backgroundColor: '#C9A84C', WebkitMaskImage: 'url("/Tayfa.png")', maskImage: 'url("/Tayfa.png")', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }} />
        </Link>
      </motion.div>

      {/* Headline & Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-8 text-center">
        <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-serif text-white leading-tight mb-6" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          Sell More, <span style={{ color: '#C9A84C' }}>Manage Less</span><br />Grow Faster.
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-base leading-relaxed mb-4" style={{ color: '#B8B0A0', maxWidth: 360 }}>
          TAYFA streamlines your fashion operations, so you can focus on creativity while we handle the complexity.
        </motion.p>



        {/* Social Media */}
        <div className="flex flex-col items-center gap-4 my-4">
          <span className="text-[9px] font-bold tracking-[0.5em] text-brand-gold uppercase opacity-60">Follow Us</span>
          <div className="flex gap-5">
            {[
              { Icon: Instagram, href: 'https://instagram.com/tayfa.pk' },
              { Icon: Facebook, href: 'https://facebook.com/tayfa.pk' },
              { Icon: TikTokIcon, href: 'https://tiktok.com/@tayfa.pk' },
              { Icon: Twitter, href: 'https://twitter.com/tayfa.pk' }
            ].map((social, i) => (
              <motion.a key={i} href={social.href} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.15 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                className="w-9 h-9 border border-brand-gold/70 rounded-full flex items-center justify-center text-brand-gold transition-all hover:border-brand-gold hover:brightness-125 hover:shadow-[0_0_15px_rgba(201,168,76,0.5)]">
                <social.Icon size={16} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Seller community */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="relative z-10 flex flex-col items-center gap-4 mb-4">
        <div className="flex -space-x-3">
          {[
            { color: '#C9A84C', delay: 0 }, { color: '#A0896A', delay: 0.1 },
            { color: '#7A6145', delay: 0.2 }, { color: '#D4B98C', delay: 0.3 },
            { color: '#8C7355', delay: 0.4 }, { color: '#B59B6D', delay: 0.5 }
          ].map((u, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + u.delay }}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-white shadow-2xl relative overflow-hidden"
              style={{ background: u.color, borderColor: '#1a1a1a' }}>
              <UserIcon size={14} className="opacity-80" />
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm font-bold tracking-[0.3em] uppercase" style={{ color: '#C9A84C' }}>Growing every day</p>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Sign In Form ────────────────────────────────────────────────────────────
const SignInForm = ({ onSwitch }: { onSwitch: (tab: AuthModalTab) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [role, setRole] = useState<'user' | 'seller' | 'admin'>('user');
  const role = 'user' as const; // role tabs hidden — backend determines actual role
  const [rememberMe, setRememberMe] = useState(false);

  const { login, googleLogin } = useAuth();
  const { closeModal } = useAuthModal();
  const navigate = useNavigate();

  useEffect(() => {
    // const lastRole = localStorage.getItem('tayfa_last_role');
    // if (lastRole === 'user' || lastRole === 'seller' || lastRole === 'admin') setRole(lastRole);
    const savedEmail = localStorage.getItem('tayfa_remember_email');
    if (savedEmail) { setEmail(savedEmail); setRememberMe(true); }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      await login(email, password);
      if (rememberMe) localStorage.setItem('tayfa_remember_email', email);
      else localStorage.removeItem('tayfa_remember_email');
      closeModal();
      navigate('/');
      // Role-based navigation removed — tabs hidden, backend determines role
      // if (role === 'admin') navigate('/admin/dashboard');
      // else if (role === 'seller') navigate('/seller/dashboard');
      // else navigate('/');
    } catch (err: any) { setError(err.message || 'Invalid credentials'); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSuccess = async (token: string) => {
    setIsLoading(true);
    setError('');
    try {
      await googleLogin(token, '');
      closeModal();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Role tabs hidden — role selector removed
  // const roles = [
  //   { id: 'user', label: 'Customer', icon: UserIcon },
  //   { id: 'seller', label: 'Seller', icon: Store },
  //   { id: 'admin', label: 'Admin', icon: ShieldCheck },
  // ];

  return (
    <div className="space-y-4">
      {/* Role selector — hidden */}
      {/* <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-brand-dark mb-3 text-center">Select Your Role</label>
        <div className="flex p-1.5 bg-brand-cream/50 rounded-2xl border border-brand-dark/5">
          {roles.map((r) => (
            <button key={r.id} type="button" onClick={() => setRole(r.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl transition-all relative ${role === r.id ? 'text-white font-bold' : 'text-brand-dark/40 hover:text-brand-dark/60'}`}>
              {role === r.id && <motion.div layoutId="modal-active-role" className="absolute inset-0 bg-brand-dark shadow-lg rounded-xl" />}
              <r.icon size={13} className="relative z-10" />
              <span className="text-[10px] uppercase tracking-widest relative z-10">{r.label}</span>
            </button>
          ))}
        </div>
      </div> */}

      <AnimatePresence mode="wait">
        <motion.form key={role} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-[11px] font-medium flex items-center space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" /><span>{error}</span>
            </motion.div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark mb-1.5 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={15} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" /></div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-brand-cream/20 border border-brand-dark/5 rounded-xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 text-sm transition-all placeholder:text-brand-dark/20"
                placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark">Password</label>
              <Link to="/forgot-password" onClick={closeModal} className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/80 transition-colors">Forgot?</Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={15} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" /></div>
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-11 py-3 bg-brand-cream/20 border border-brand-dark/5 rounded-xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 text-sm transition-all placeholder:text-brand-dark/20"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-dark/20 hover:text-brand-gold transition-colors">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <label className="flex items-center cursor-pointer group">
            <div className="relative flex-shrink-0">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="sr-only" />
              <div className={`w-9 h-5 rounded-full transition-all duration-300 ${rememberMe ? 'bg-brand-gold' : 'bg-brand-dark/10'}`} />
              <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 transform ${rememberMe ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 group-hover:text-brand-dark/60 transition-colors">Remember Me</span>
          </label>
          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-brand-dark hover:bg-brand-gold disabled:opacity-50 transition-all duration-300 group shadow-lg shadow-brand-dark/10">
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            {!isLoading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </motion.form>
      </AnimatePresence>

      {/* Google Login */}
      <div className="pt-1">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-dark/5" /></div>
          <div className="relative flex justify-center text-[9px]"><span className="px-3 bg-white text-brand-dark/30 uppercase tracking-[0.3em] font-bold">Or continue with</span></div>
        </div>
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed. Please try again.')}
          label="Google"
        />
      </div>

      <div className="text-center pt-1">
        <p className="text-[11px] text-brand-dark/40 uppercase tracking-widest font-medium">
          New to the platform?{' '}
          <button onClick={() => onSwitch('signup')} className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">Create Account</button>
        </p>
        {/* Seller link hidden — role tabs removed */}
        {/* {role === 'seller' && (
          <p className="text-[11px] text-brand-dark/40 uppercase tracking-widest font-medium">
            Want to sell?{' '}
            <button onClick={() => onSwitch('seller')} className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">Apply as Seller</button>
          </p>
        )} */}
      </div>
    </div>
  );
};

// ─── Sign Up Form ────────────────────────────────────────────────────────────
const SignUpForm = ({ onSwitch }: { onSwitch: (tab: AuthModalTab) => void }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { registerUser } = useAuth();
  const { closeModal } = useAuthModal();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (!formData.terms) { setError('Please accept the Terms & Conditions'); return; }
    setIsLoading(true);
    try { await registerUser(formData); setIsSuccess(true); setTimeout(() => { closeModal(); navigate('/'); }, 2000); }
    catch (err: any) { setError(err.message || 'Failed to create account'); }
    finally { setIsLoading(false); }
  };

  // Google sign-up hidden — handler kept for reference
  // const handleGoogleSuccess = async (token: string) => {
  //   setIsLoading(true);
  //   setError('');
  //   try {
  //     await googleLogin(token, 'user');
  //     closeModal();
  //     navigate('/');
  //   } catch (err: any) {
  //     setError(err.message || 'Google sign-up failed.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  if (isSuccess) return (
    <div className="text-center py-10">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={28} className="text-emerald-500" />
      </motion.div>
      <h3 className="text-lg font-serif text-brand-dark mb-2">Registration Successful!</h3>
      <p className="text-xs text-brand-dark/40 mb-6">Redirecting you to your fashion feed...</p>
      <div className="w-10 h-1 bg-brand-cream rounded-full mx-auto overflow-hidden">
        <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-full h-full bg-brand-gold" />
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-[11px] font-medium flex items-center space-x-3">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" /><span>{error}</span>
          </motion.div>
        )}
        {[
          { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'John Doe', icon: UserIcon },
          { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@example.com', icon: Mail },
          { label: 'Phone (Optional)', name: 'phone', type: 'tel', placeholder: '+92 300 1234567', icon: Phone },
        ].map(({ label, name, type, placeholder, icon: Icon }) => (
          <div key={name}>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark mb-1.5 ml-1">{label}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Icon size={15} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" /></div>
              <input type={type} name={name} value={(formData as any)[name]} onChange={handleChange} required={name !== 'phone'}
                className="block w-full pl-11 pr-4 py-3 bg-brand-cream/20 border border-brand-dark/5 rounded-xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 text-sm transition-all placeholder:text-brand-dark/20"
                placeholder={placeholder} />
            </div>
          </div>
        ))}
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark mb-1.5 ml-1">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={15} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" /></div>
            <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange}
              className="block w-full pl-11 pr-11 py-3 bg-brand-cream/20 border border-brand-dark/5 rounded-xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 text-sm transition-all placeholder:text-brand-dark/20"
              placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-dark/20 hover:text-brand-gold transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {formData.password && <PasswordStrength password={formData.password} />}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark mb-1.5 ml-1">Confirm Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={15} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" /></div>
            <input type={showPassword ? 'text' : 'password'} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
              className="block w-full pl-11 pr-4 py-3 bg-brand-cream/20 border border-brand-dark/5 rounded-xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 text-sm transition-all placeholder:text-brand-dark/20"
              placeholder="••••••••" />
          </div>
        </div>
        <div className="flex items-start gap-3">
          <input id="modal-terms" name="terms" type="checkbox" checked={formData.terms} onChange={handleChange}
            className="h-4 w-4 mt-0.5 text-brand-gold focus:ring-brand-gold border-brand-dark/10 rounded cursor-pointer flex-shrink-0" />
          <label htmlFor="modal-terms" className="text-[10px] text-brand-dark/50 leading-relaxed uppercase tracking-widest font-bold cursor-pointer">
            I agree to the{' '}
            <Link to="/terms" onClick={closeModal} className="text-brand-gold underline underline-offset-4">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" onClick={closeModal} className="text-brand-gold underline underline-offset-4">Privacy Policy</Link>
          </label>
        </div>
        <button type="submit" disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-brand-dark hover:bg-brand-gold disabled:opacity-50 transition-all duration-300 group shadow-lg shadow-brand-dark/10">
          <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
          {!isLoading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      {/* Google Sign Up — hidden on sign-up page */}
      {/* <div>
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-dark/5" /></div>
          <div className="relative flex justify-center text-[9px]"><span className="px-3 bg-white text-brand-dark/30 uppercase tracking-[0.3em] font-bold">Or sign up with</span></div>
        </div>
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google sign-up failed. Please try again.')}
        />
      </div> */}

      <div className="text-center">
        <p className="text-[11px] text-brand-dark/40 uppercase tracking-widest font-medium">
          Already a member?{' '}
          <button onClick={() => onSwitch('signin')} className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">Sign In</button>
        </p>
      </div>
    </div>
  );
};

// ─── Seller Form (unchanged) ─────────────────────────────────────────────────
interface Brand { name: string; description: string; website: string; }
interface Company {
  name: string; registrationNumber: string; taxId: string;
  addressLine1: string; city: string; state: string; postalCode: string;
  countryCode: string; phone: string; email: string; brands: Brand[];
}

const SellerForm = ({ onSwitch }: { onSwitch: (tab: AuthModalTab) => void }) => {
  const { countries, selectedCountry } = useCurrency();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    category: '', customCategory: '', overviewDocument: null as File | null,
    companies: [{ name: '', registrationNumber: '', taxId: '', addressLine1: '', city: '', state: '', postalCode: '', countryCode: '', phone: '', email: '', brands: [{ name: '', description: '', website: '' }] }] as Company[],
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { registerSeller } = useAuth();
  const { closeModal } = useAuthModal();
  const navigate = useNavigate();
  const totalSteps = 3;

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) { setError('Please fill in all required fields'); return; }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    } else if (step === 2) {
      const fc = formData.companies[0];
      if (!fc.name || !fc.addressLine1 || !fc.city || !fc.state || !fc.postalCode) { setError('Please provide complete company business information'); return; }
      if (!fc.brands[0].name) { setError('Please provide at least one brand name'); return; }
    } else if (step === 3) {
      if (!formData.category || (formData.category === 'Other' && !formData.customCategory)) { setError('Please select a business category'); return; }
      if (!formData.overviewDocument) { setError('Please upload your Business Overview Document'); return; }
    }
    setStep(p => p + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return;
    if (!formData.terms) { setError('Please accept the Seller Agreement'); return; }
    setIsLoading(true);
    try { await registerSeller(formData); setIsSuccess(true); }
    catch (err: any) { setError(err.message || 'Failed to register as seller'); }
    finally { setIsLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { setError('File size exceeds 5MB limit'); return; }
        setFormData(p => ({ ...p, [name]: file }));
      }
      return;
    }
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCompanyChange = (index: number, field: keyof Company, value: string) => {
    const updated = [...formData.companies];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(p => ({ ...p, companies: updated }));
  };

  const addCompany = () => setFormData(p => ({ ...p, companies: [...p.companies, { name: '', registrationNumber: '', taxId: '', addressLine1: '', city: '', state: '', postalCode: '', phone: '', email: '', countryCode: selectedCountry?.code || 'PK', brands: [{ name: '', description: '', website: '' }] }] }));
  const removeCompany = (i: number) => { if (formData.companies.length === 1) return; setFormData(p => ({ ...p, companies: p.companies.filter((_, idx) => idx !== i) })); };

  const handleBrandChange = (ci: number, bi: number, field: keyof Brand, value: string) => {
    const updated = [...formData.companies];
    const brands = [...updated[ci].brands];
    brands[bi] = { ...brands[bi], [field]: value };
    updated[ci] = { ...updated[ci], brands };
    setFormData(p => ({ ...p, companies: updated }));
  };

  const addBrand = (ci: number) => { const updated = [...formData.companies]; updated[ci].brands.push({ name: '', description: '', website: '' }); setFormData(p => ({ ...p, companies: updated })); };
  const removeBrand = (ci: number, bi: number) => { const updated = [...formData.companies]; if (updated[ci].brands.length === 1) return; updated[ci].brands = updated[ci].brands.filter((_, i) => i !== bi); setFormData(p => ({ ...p, companies: updated })); };

  if (isSuccess) return (
    <div className="text-center py-10">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-14 h-14 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={28} className="text-brand-gold" />
      </motion.div>
      <h3 className="text-lg font-serif text-brand-dark mb-3">Application Received!</h3>
      <p className="text-xs text-brand-dark/60 max-w-xs mx-auto mb-6 leading-relaxed">Our curation team is reviewing your application. You'll receive an email once your boutique is ready to go live.</p>
      <button onClick={() => { closeModal(); navigate('/'); }} className="inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors">
        <span>Return to Marketplace</span><ArrowRight size={14} />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${step >= s ? 'bg-brand-dark text-white shadow-lg shadow-brand-dark/20' : 'bg-brand-cream text-brand-dark/30'}`}>
                {step > s ? <CheckCircle2 size={13} /> : s}
              </div>
              <span className={`mt-1 text-[8px] font-bold uppercase tracking-tighter transition-colors ${step >= s ? 'text-brand-dark' : 'text-brand-dark/20'}`}>
                {s === 1 ? 'Account' : s === 2 ? 'Business' : 'Verify'}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-brand-cream rounded-full overflow-hidden">
          <motion.div initial={{ width: '0%' }} animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }} className="h-full bg-brand-gold" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-[11px] font-medium flex items-center space-x-3">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" /><span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              {[
                { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'John Doe', icon: UserIcon },
                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'biz@example.com', icon: Mail },
                { label: 'Contact Number', name: 'phone', type: 'tel', placeholder: '+92 300 1234567', icon: Phone },
              ].map(({ label, name, type, placeholder, icon: Icon }) => (
                <div key={name}>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark mb-1.5 ml-1">{label}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Icon size={15} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" /></div>
                    <input type={type} name={name} required value={(formData as any)[name]} onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 bg-brand-cream/20 border border-brand-dark/5 rounded-xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 text-sm transition-all placeholder:text-brand-dark/20"
                      placeholder={placeholder} />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={15} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" /></div>
                  <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange}
                    className="block w-full pl-11 pr-11 py-3 bg-brand-cream/20 border border-brand-dark/5 rounded-xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 text-sm transition-all placeholder:text-brand-dark/20"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-dark/20 hover:text-brand-gold transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {formData.password && <PasswordStrength password={formData.password} />}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark mb-1.5 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={15} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" /></div>
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-brand-cream/20 border border-brand-dark/5 rounded-xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 text-sm transition-all placeholder:text-brand-dark/20"
                    placeholder="••••••••" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {formData.companies.map((company, cIndex) => (
                <div key={cIndex} className="p-4 bg-brand-cream/10 rounded-2xl border border-brand-dark/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark flex items-center">
                      <Building size={13} className="mr-2 text-brand-gold" />Company {formData.companies.length > 1 ? cIndex + 1 : ''}
                    </h3>
                    {formData.companies.length > 1 && <button type="button" onClick={() => removeCompany(cIndex)} className="text-rose-500 hover:text-rose-600 transition-colors"><Trash2 size={14} /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark mb-1">Company Name</label>
                      <input type="text" required value={company.name} onChange={(e) => handleCompanyChange(cIndex, 'name', e.target.value)}
                        className="block w-full px-3 py-2.5 bg-white border border-brand-dark/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all" placeholder="Luxe Group" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark mb-1">Reg. Number</label>
                      <input type="text" value={company.registrationNumber} onChange={(e) => handleCompanyChange(cIndex, 'registrationNumber', e.target.value)}
                        className="block w-full px-3 py-2.5 bg-white border border-brand-dark/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all" placeholder="REG-12345" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark mb-1">Country</label>
                      <div className="relative">
                        <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/20" />
                        <select required value={company.countryCode} onChange={(e) => handleCompanyChange(cIndex, 'countryCode', e.target.value)}
                          className="block w-full pl-8 pr-4 py-2.5 bg-white border border-brand-dark/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all appearance-none">
                          <option value="">Select</option>
                          {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark mb-1">Address</label>
                      <input type="text" required value={company.addressLine1} onChange={(e) => handleCompanyChange(cIndex, 'addressLine1', e.target.value)}
                        className="block w-full px-3 py-2.5 bg-white border border-brand-dark/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all" placeholder="123 Fashion Ave" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'City', field: 'city' as keyof Company, placeholder: 'Karachi' },
                      { label: 'State', field: 'state' as keyof Company, placeholder: 'Sindh' },
                      { label: 'Postal', field: 'postalCode' as keyof Company, placeholder: '75500' },
                    ].map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark mb-1">{label}</label>
                        <input type="text" required value={company[field] as string} onChange={(e) => handleCompanyChange(cIndex, field, e.target.value)}
                          className="block w-full px-3 py-2.5 bg-white border border-brand-dark/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all" placeholder={placeholder} />
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-brand-dark/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/50">Brands</h4>
                      <button type="button" onClick={() => addBrand(cIndex)} className="text-[9px] font-bold uppercase tracking-widest text-brand-gold flex items-center hover:text-brand-dark transition-colors">
                        <Plus size={11} className="mr-1" />Add
                      </button>
                    </div>
                    {company.brands.map((brand, bIndex) => (
                      <div key={bIndex} className="relative p-3 bg-brand-cream/30 rounded-xl border border-brand-dark/5 space-y-2">
                        <button type="button" onClick={() => removeBrand(cIndex, bIndex)} className="absolute -top-2 -right-2 w-7 h-7 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-sm border border-rose-100 hover:bg-rose-500 hover:text-white transition-all z-20">
                          <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Brand Name" required value={brand.name} onChange={(e) => handleBrandChange(cIndex, bIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-brand-dark/5 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-gold/20 outline-none" />
                          <div className="relative">
                            <Globe size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-dark/20" />
                            <input type="url" placeholder="Website URL" value={brand.website} onChange={(e) => handleBrandChange(cIndex, bIndex, 'website', e.target.value)}
                              className="w-full pl-6 pr-3 py-2 bg-white border border-brand-dark/5 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-gold/20 outline-none" />
                          </div>
                        </div>
                        <input type="text" placeholder="Short Brand Description" value={brand.description} onChange={(e) => handleBrandChange(cIndex, bIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-brand-dark/5 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-gold/20 outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addCompany} className="w-full py-3 border-2 border-dashed border-brand-dark/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 hover:border-brand-gold/30 hover:text-brand-gold transition-all flex items-center justify-center space-x-2">
                <Plus size={14} /><span>Add Another Company</span>
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark ml-1">Business Category</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Briefcase size={15} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" /></div>
                  <select name="category" required value={formData.category} onChange={handleChange}
                    className="block w-full pl-11 pr-10 py-3 bg-brand-cream/20 border border-brand-dark/5 rounded-xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 text-sm appearance-none transition-all">
                    <option value="">Select your business category</option>
                    {['Fashion', 'Electronics', 'Home & Living', 'Beauty', 'Accessories', 'Footwear', 'Other'].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-dark/20"><ChevronDown size={15} /></div>
                </div>
                {formData.category === 'Other' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-1">
                    <input type="text" name="customCategory" required value={formData.customCategory} onChange={handleChange}
                      placeholder="Please specify your category"
                      className="block w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-xl focus:ring-2 focus:ring-brand-gold/10 text-sm" />
                  </motion.div>
                )}
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark ml-1">Business Overview Document</label>
                <div className={`relative group p-6 border-2 border-dashed rounded-2xl transition-all text-center ${formData.overviewDocument ? 'bg-brand-gold/5 border-brand-gold/30' : 'bg-brand-cream/5 border-brand-dark/10 hover:border-brand-gold/30 cursor-pointer'}`}>
                  {formData.overviewDocument ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">
                        <ShieldCheck className="text-brand-gold" size={24} />
                      </div>
                      <p className="text-[10px] font-bold text-brand-dark uppercase tracking-widest break-all px-4">{formData.overviewDocument.name}</p>
                      <button type="button" onClick={() => setFormData(p => ({ ...p, overviewDocument: null }))} className="mt-3 text-[9px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 flex items-center">
                        <Trash2 size={12} className="mr-1" /> Remove File
                      </button>
                    </div>
                  ) : (
                    <>
                      <input type="file" name="overviewDocument" accept=".pdf,.jpg,.png" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" title="" />
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
                        <Upload className="text-brand-dark/20 group-hover:text-brand-gold transition-colors" size={20} />
                      </div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark mb-1">Drop file here or click to upload</h4>
                      <p className="text-[9px] text-brand-dark/40 uppercase tracking-tighter">PDF, JPG or PNG (MAX 5MB)</p>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-brand-gold/5 border border-brand-gold/10 p-3 rounded-xl flex items-start space-x-3">
                <Info size={14} className="text-brand-gold shrink-0 mt-0.5" />
                <p className="text-[10px] text-brand-dark/60 leading-relaxed uppercase tracking-widest font-medium">Review takes 2-3 business days. You'll receive an email with the outcome.</p>
              </div>
              <div className="flex items-start p-3 bg-brand-cream/10 rounded-xl border border-brand-dark/5">
                <div className="flex items-center h-5">
                  <input id="seller-terms" name="terms" type="checkbox" checked={formData.terms} onChange={handleChange}
                    className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-brand-dark/10 rounded" />
                </div>
                <label htmlFor="seller-terms" className="ml-3 text-[10px] text-brand-dark/60 leading-relaxed uppercase tracking-widest font-medium cursor-pointer">
                  I agree to the{' '}
                  <Link to="/seller-terms" onClick={closeModal} className="font-bold text-brand-gold underline underline-offset-4">Seller Agreement</Link>
                  {' '}and verify all information is accurate.
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex space-x-3 pt-2">
          {step > 1 && (
            <button type="button" onClick={() => setStep(p => p - 1)} className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-brand-dark/5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-brand-dark hover:bg-brand-cream/30 transition-all">
              <ArrowLeft size={14} /><span>Back</span>
            </button>
          )}
          {step < totalSteps ? (
            <button type="button" onClick={nextStep} className="flex-[2] flex items-center justify-center space-x-3 py-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-brand-dark hover:bg-brand-gold transition-all group shadow-lg shadow-brand-dark/10">
              <span>Continue</span><ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button type="submit" disabled={isLoading} className="flex-[2] flex items-center justify-center space-x-3 py-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-brand-dark hover:bg-brand-gold disabled:opacity-50 transition-all shadow-lg shadow-brand-dark/10">
              <Briefcase size={14} /><span>{isLoading ? 'Submitting...' : 'Apply Now'}</span>
            </button>
          )}
        </div>
      </form>
      <div className="text-center">
        <p className="text-[11px] text-brand-dark/40 uppercase tracking-widest font-medium">
          Already have an account?{' '}
          <button onClick={() => onSwitch('signin')} className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">Sign In</button>
        </p>
      </div>
    </div>
  );
};

// ─── Main Modal ──────────────────────────────────────────────────────────────
const AuthModal: React.FC = () => {
  const { isOpen, activeTab, closeModal, setActiveTab } = useAuthModal();

  const headings: Record<AuthModalTab, string> = {
    signin: 'Welcome Back',
    signup: 'Join TAYFA',
    seller: 'Partner with TAYFA',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] overflow-hidden"
            style={{ background: 'rgba(10,8,6,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={closeModal}
          >
            <motion.div animate={{ y: [0, -40, 0], opacity: [0.3, 0.45, 0.3] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute pointer-events-none rounded-full blur-[100px]"
              style={{ width: 500, height: 500, left: '-10%', top: '20%', backgroundColor: '#C9A84C', opacity: 0.3 }} />
            <motion.div animate={{ y: [0, 40, 0], opacity: [0.25, 0.4, 0.25] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute pointer-events-none rounded-full blur-[80px]"
              style={{ width: 400, height: 400, right: '-5%', bottom: '10%', backgroundColor: '#C9A84C', opacity: 0.25 }} />
          </motion.div>

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', position: 'relative', background: '#ffffff', boxShadow: '0 32px 80px rgba(0,0,0,0.35)', borderRadius: 24, overflow: 'hidden', width: 'min(1150px, 100vw)', height: 'min(720px, 100vh)', minWidth: 'min(1150px, 100vw)', maxWidth: 1150 }}>
              <button onClick={closeModal} className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-brand-dark/5 hover:bg-brand-dark/10 flex items-center justify-center text-brand-dark/40 hover:text-brand-dark transition-all">
                <X size={17} />
              </button>

              <BrandPanel />

              <div className="flex flex-col bg-white" style={{ width: '50%', flexShrink: 0, flexGrow: 0, height: '100%', overflow: 'hidden' }}>
                {/* Tab bar */}
                <div className="flex-shrink-0 px-12 pt-12 pb-2">
                  <h2 className="font-serif text-brand-dark text-center" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>
                    {headings[activeTab]}
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto px-12 py-6">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28, ease: 'easeOut' }}>
                      {activeTab === 'signin' && <SignInForm onSwitch={(t) => setActiveTab(t)} />}
                      {activeTab === 'signup' && <SignUpForm onSwitch={(t) => setActiveTab(t)} />}
                      {activeTab === 'seller' && <SellerForm onSwitch={(t) => setActiveTab(t)} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;