import React, { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, BarChart3, Settings, 
  LogOut, Menu, X, Bell, Search, ChevronRight,
  Ticket, Tag, FileText, CreditCard, ShoppingBag, 
  Truck, BookOpen, Plus, Upload, Activity,
  Globe, Layers, Award, BellRing, Languages, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import AccessDenied from '../../components/admin/AccessDenied';

const SellerLayout = () => {
  const { user, logout, hasPermission, isAuthReady } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Show Access Denied if logged in but not seller
  if (user.role !== 'seller') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-8">
        <AccessDenied requiredRole="seller" />
      </div>
    );
  }

  const modules = [
    {
      label: 'Operations',
      items: [
        { icon: LayoutDashboard, label: 'Overview', path: '/seller/dashboard', module: 'overview' },
        { icon: ShoppingBag, label: 'Orders', path: '/seller/orders', module: 'orders' },
        { icon: FileText, label: 'Invoices', path: '/seller/invoices', module: 'invoices' },
        { icon: CreditCard, label: 'Payments', path: '/seller/payments', module: 'payments' },
        { icon: FileText, label: 'Pricelists', path: '/seller/pricelists', module: 'pricelist' },
        { icon: Tag, label: 'Promotions', path: '/seller/promotions', module: 'promotions' },
        { icon: Ticket, label: 'Coupons', path: '/seller/coupons', module: 'coupons' },
        { icon: Tag, label: 'Discounts', path: '/seller/discounts', module: 'discounts' },
        { icon: Upload, label: 'Bulk Upload', path: '/seller/bulk-upload', module: 'bulk_upload' },
        { icon: Plus, label: 'Add Product', path: '/seller/add-product', module: 'products' },
      ]
    },
    {
      label: 'Reporting',
      items: [
        { icon: BarChart3, label: 'Sales Analytics', path: '/seller/analytics', module: 'analytics' },
        { icon: BookOpen, label: 'Ledger', path: '/seller/ledger', module: 'ledger' },
        { icon: Activity, label: 'Activity Logs', path: '/seller/logs', module: 'system' },
      ]
    },
    {
      label: 'Configurations',
      items: [
        { icon: Truck, label: 'Shipping', path: '/seller/shipping', module: 'shipping' },
        { icon: ShieldCheck, label: 'Security Settings', path: '/seller/security', module: 'settings' },
      ]
    },
    {
      label: 'Settings',
      items: [
        { icon: Settings, label: 'Account Settings', path: '/account-settings', module: 'settings' },
      ]
    }
  ];

  const filteredModules = modules.map(mod => ({
    ...mod,
    items: mod.items.filter(item => hasPermission(item.module as any, 'view'))
  })).filter(mod => mod.items.length > 0);

  return (
    <div className="min-h-screen bg-brand-cream flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-80 bg-brand-dark text-white border-r border-white/5 sticky top-0 h-screen overflow-y-auto">
        <div className="p-10 border-b border-white/5">
          <Link to="/" className="group block">
            <h1 className="text-4xl font-serif tracking-tighter text-brand-gold group-hover:text-white transition-colors">TAYFA</h1>
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 block mt-2 group-hover:text-brand-gold/40 transition-colors">SELLER_PORTAL_v2.0</span>
          </Link>
        </div>

        <nav className="flex-grow p-6 space-y-8">
          {filteredModules.map((module) => (
            <div key={module.label} className="space-y-2">
              <div className="px-4 mb-4">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 font-serif italic">{module.label}</h3>
              </div>
              <div className="space-y-1">
                {module.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all group relative overflow-hidden ${
                      location.pathname === item.path 
                        ? 'bg-brand-gold text-white shadow-xl shadow-brand-gold/20' 
                        : 'text-white/40 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className={location.pathname === item.path ? 'text-white' : 'text-brand-gold/40 group-hover:text-brand-gold transition-colors'} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
                    {location.pathname === item.path && (
                      <motion.div layoutId="active-indicator" className="ml-auto">
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </motion.div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-6 bg-black/20">
          <div className="flex items-center space-x-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold border border-brand-gold/20 group-hover:bg-brand-gold group-hover:text-white transition-all">
              {(user.fullName || '?').charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold truncate uppercase tracking-wider">{user.fullName}</p>
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-mono">SELLER_NODE_01</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all group border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Terminate_Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-brand-dark/5 sticky top-0 z-40 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-brand-dark hover:text-brand-gold transition-colors bg-brand-cream/50 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="ml-4 text-xl font-serif tracking-tighter text-brand-gold">TAYFA</Link>
          </div>

          <div className="hidden lg:flex items-center flex-grow max-w-2xl relative group">
            <Search size={16} className="absolute left-6 text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
            <input 
              type="text" 
              placeholder="SELLER_PORTAL_SEARCH..." 
              className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl pl-14 pr-8 py-4 text-[10px] font-mono uppercase tracking-[0.2em] focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all placeholder:text-brand-dark/20"
            />
          </div>

          <div className="flex items-center space-x-6">
            <button className="p-4 bg-brand-cream/50 text-brand-dark rounded-2xl hover:bg-brand-gold hover:text-white transition-all relative group shadow-sm">
              <Bell size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
            </button>
            
            <div className="w-px h-10 bg-brand-dark/5 mx-2" />
            
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold leading-none mb-1 uppercase tracking-wider">{user.fullName}</p>
                <p className="text-[9px] text-brand-dark/30 uppercase tracking-[0.2em] font-mono">VERIFIED_SELLER</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold shadow-xl shadow-brand-dark/20 group-hover:bg-brand-gold transition-all overflow-hidden relative">
                <span className="relative z-10">{(user.fullName || '?').charAt(0)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-8 lg:p-12 flex-grow">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-[60]"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-brand-dark text-white p-8 z-[70] flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <Link to="/" className="text-3xl font-serif tracking-tighter text-brand-gold">TAYFA</Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/60 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-grow space-y-8 overflow-y-auto pr-4">
                {filteredModules.map((module) => (
                  <div key={module.label} className="space-y-2">
                    <h3 className="px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 font-serif italic mb-4">{module.label}</h3>
                    <div className="space-y-1">
                      {module.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${
                            location.pathname === item.path 
                              ? 'bg-brand-gold text-white shadow-lg' 
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <item.icon size={20} className={location.pathname === item.path ? 'text-white' : 'text-brand-gold'} />
                          <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-white/10">
                <button 
                  onClick={logout}
                  className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-bold uppercase tracking-widest">Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerLayout;
