import React, { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, Package, BarChart3, Shield, Settings, 
  LogOut, Menu, X, Bell, Search, User, ChevronRight, ChevronDown, Sparkles,
  Ticket, Tag, FileText, Globe, Layers, Award, CreditCard, Percent,
  ShoppingBag, BookOpen, Building, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import AccessDenied from '../../components/admin/AccessDenied';

const AdminLayout = () => {
  const { user, logout, hasPermission, isAuthReady } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('admin_sidebar_expanded');
    return saved ? JSON.parse(saved) : {
      'Operations': true,
      'Reporting': true,
      'Configurations': true,
      'Settings': true
    };
  });

  const modules = [
    {
      label: 'Operations',
      items: [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard', module: 'overview' },
        { icon: ShoppingBag, label: 'Orders', path: '/admin/orders', module: 'orders' },
        { icon: FileText, label: 'Invoices', path: '/admin/invoices', module: 'invoices' },
        { icon: CreditCard, label: 'Payments', path: '/admin/payments', module: 'payments' },
        { icon: FileText, label: 'Pricelists', path: '/admin/pricelists', module: 'pricelist' },
        { icon: Sparkles, label: 'Promotions', path: '/admin/promotions', module: 'promotions' },
        { icon: Ticket, label: 'Coupons', path: '/admin/coupons', module: 'coupons' },
        { icon: Tag, label: 'Discounts', path: '/admin/discounts', module: 'discounts' },
        { icon: BookOpen, label: 'Journal', path: '/admin/blogs', module: 'blogs' },
        { icon: Package, label: 'Product Moderation', path: '/admin/products', module: 'products' },
      ]
    },
    {
      label: 'Reporting',
      items: [
        { icon: BarChart3, label: 'Sales Analytics', path: '/admin/analytics', module: 'analytics' },
        { icon: BookOpen, label: 'Ledger', path: '/admin/ledger', module: 'ledger' },
        { icon: Sparkles, label: 'System Logs', path: '/admin/logs', module: 'system' },
      ]
    },
    {
      label: 'Configurations',
      items: [
        { icon: Award, label: 'Brands', path: '/admin/brands', module: 'products' },
        { icon: Layers, label: 'Categories', path: '/admin/categories', module: 'products' },
        { icon: Tag, label: 'Filters', path: '/admin/filters', module: 'products' },
        { icon: Globe, label: 'SEO Manager', path: '/admin/seo', module: 'seo' },
        { icon: Globe, label: 'Countries', path: '/admin/countries', module: 'settings' },
        { icon: CreditCard, label: 'Payment Methods', path: '/admin/payment-methods', module: 'payments' },
        { icon: Settings, label: 'Gateway Settings', path: '/admin/payment-settings', module: 'payments' },
        { icon: Percent, label: 'Tax Management', path: '/admin/taxes', module: 'tax_rules' },
      ]
    },
    {
      label: 'Settings',
      items: [
        { icon: Users, label: 'Users & RBAC', path: '/admin/users', module: 'users' },
        { icon: Building, label: 'Seller Applications', path: '/admin/seller-applications', module: 'users' },
        { icon: Shield, label: 'Access Control', path: '/admin/access', module: 'rbac' },
        { icon: Bell, label: 'Notifications', path: '/admin/notifications', module: 'settings' },
        { icon: Globe, label: 'Localizations', path: '/admin/localizations', module: 'settings' },
        { icon: MessageSquare, label: 'Communication', path: '/admin/communication', module: 'settings' },
        { icon: Settings, label: 'System Settings', path: '/admin/settings', module: 'settings' },
      ]
    }
  ];

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

  // Show Access Denied if logged in but not admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-8">
        <AccessDenied requiredRole="admin" />
      </div>
    );
  }

  const toggleSection = (label: string) => {
    setExpandedSections(prev => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem('admin_sidebar_expanded', JSON.stringify(next));
      return next;
    });
  };

  const filteredModules = modules.map(mod => ({
    ...mod,
    items: mod.items.filter(item => hasPermission(item.module as any, 'view'))
  })).filter(mod => mod.items.length > 0);

  return (
    <div className="min-h-screen bg-brand-cream flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-80 bg-brand-dark text-white border-r border-white/5 sticky top-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="px-10 py-6 border-b border-white/5">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <img src="/Tayfa.png" alt="TAYFA" className="h-14 w-auto brightness-0 invert" />
          </Link>
        </div>

        <nav className="flex-grow p-6 space-y-4">
          {filteredModules.map((module) => {
            const isExpanded = expandedSections[module.label] ?? true;
            return (
              <div key={module.label} className="space-y-1">
                <button 
                  onClick={() => toggleSection(module.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group border-l-2 ${
                    isExpanded ? 'border-brand-gold/50 bg-white/5 shadow-[2px_0_15px_rgba(201,168,76,0.05)]' : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/80 group-hover:text-white group-hover:brightness-150 transition-all">
                    {module.label}
                  </h3>
                  <motion.div
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  >
                    <ChevronDown size={14} className="text-white/20 group-hover:text-brand-gold transition-colors" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0, y: -10 }}
                      transition={{ 
                        height: { type: 'spring', damping: 25, stiffness: 200 },
                        opacity: { duration: 0.2 }
                      }}
                      className="overflow-hidden space-y-1"
                    >
                      {module.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all group relative overflow-hidden ${
                              isActive
                                ? 'bg-brand-gold text-white shadow-[0_10px_20px_rgba(201,168,76,0.2)]' 
                                : 'text-white/40 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <item.icon size={18} className={isActive ? 'text-white' : 'text-brand-gold/40 group-hover:text-brand-gold transition-colors'} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
                            {isActive && (
                              <motion.div layoutId="active-indicator" className="ml-auto">
                                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                              </motion.div>
                            )}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-6 bg-black/20">
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all group border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Logout</span>
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
            <Link to="/" className="ml-4">
              <img src="/Tayfa.png" alt="TAYFA" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="hidden lg:flex items-center flex-grow max-w-2xl relative group">
            <Search size={16} className="absolute left-6 text-brand-dark/40 group-focus-within:text-brand-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-white border border-brand-dark/10 rounded-2xl pl-14 pr-8 py-4 text-[10px] font-mono uppercase tracking-[0.2em] focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/30 transition-all placeholder:text-brand-dark/30 shadow-sm"
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
                {/* <p className="text-[9px] text-brand-dark/30 uppercase tracking-[0.2em] font-mono">ROOT_ADMIN</p> */}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold shadow-xl shadow-brand-dark/20 group-hover:bg-brand-gold transition-all overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <Link to="/" className="inline-block">
                  <img src="/Tayfa.png" alt="TAYFA" className="h-10 w-auto brightness-0 invert" />
                </Link>
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

export default AdminLayout;
