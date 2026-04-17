import React from 'react';
import { User, Package, Heart, Settings, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

const Account = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { openModal } = useAuthModal();

  const menuItems = [
    { icon: Package, label: 'My Orders', description: 'Track, return or buy things again', path: '/orders' },
    { icon: Heart, label: 'Wishlist', description: 'Items you have saved for later', path: '/wishlist' },
    { icon: Settings, label: 'Account Settings', description: 'Update your profile and preferences', path: '/account-settings' },
    { icon: LogOut, label: 'Sign Out', description: 'Log out of your account', action: 'logout' },
  ];

  const handleMenuClick = (item: any) => {
    if (item.action === 'logout') {
      logout();
      navigate('/');
    } else if (item.path) {
      navigate(item.path);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-serif mb-8">Please sign in to view your account</h1>
        <button 
          onClick={() => openModal('signin')}
          className="bg-brand-dark text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
        >
          Sign In
        </button>
      </div>
    );
  }

  const initials = user.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-20">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-8 mb-10 sm:mb-16">
        <div className="w-20 h-20 sm:w-32 sm:h-32 bg-brand-gold rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl font-serif shadow-lg shadow-brand-gold/20 flex-shrink-0">
          {initials}
        </div>
        <div className="text-center md:text-left space-y-1 sm:space-y-2 flex-grow">
          <h1 className="text-2xl sm:text-4xl font-serif">{user.fullName}</h1>
          <p className="text-xs sm:text-base text-brand-dark/60">{user.email}</p>
          <div className="pt-1.5 sm:pt-2">
            <span className="inline-block bg-brand-gold/10 text-brand-gold text-[8px] sm:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Seller' : 'TAYFA Member'}
            </span>
          </div>
        </div>
        
        {/* Dashboard Shortcut */}
        {(user.role === 'admin' || user.role === 'seller') && (
          <div className="mt-6 md:mt-4">
            <button 
              onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/seller/dashboard')}
              className="group flex items-center space-x-3 bg-white border border-brand-gold/30 text-brand-gold px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all shadow-sm hover:shadow-brand/20"
            >
              <LayoutDashboard size={16} className="group-hover:rotate-12 transition-transform" />
              <span>Go to Dashboard</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.label}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleMenuClick(item)}
            className="flex items-center p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all text-left group w-full border border-brand-dark/5"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-cream rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-gold mr-4 sm:mr-6 group-hover:bg-brand-gold group-hover:text-white transition-colors flex-shrink-0">
              <item.icon size={18} className="sm:w-6 sm:h-6" />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-serif text-base sm:text-lg truncate">{item.label}</h3>
              <p className="text-[9px] sm:text-xs text-brand-dark/40 truncate">{item.description}</p>
            </div>
            <ChevronRight size={16} className="text-brand-dark/20 group-hover:text-brand-gold transition-colors ml-2 flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      <div className="mt-10 sm:mt-20 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-brand-dark text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg sm:text-2xl font-serif mb-2 sm:mb-4">TAYFA Rewards</h3>
          <p className="text-white/60 text-[10px] sm:text-sm mb-4 sm:mb-6 leading-relaxed max-w-md">You have 1,250 points. Redeem them for exclusive discounts and early access to new collections.</p>
          <button className="bg-brand-gold text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all shadow-lg shadow-brand-gold/20">
            View Rewards
          </button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-brand-gold/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      </div>

    </div>
  );
};

export default Account;
