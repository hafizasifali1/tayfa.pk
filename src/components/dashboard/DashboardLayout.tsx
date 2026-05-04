import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  User,
  CreditCard,
  FileText,
  BookOpen,
  Ticket,
  Tag,
  Sparkles,
  History,
  BarChart3,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Module } from '../../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, hasPermission, canView, isAuthReady, refreshRoles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Sync permissions on mount
  useEffect(() => {
    if (isAuthReady) {
      refreshRoles();
    }
  }, [isAuthReady]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Access Control: Allow sellers, admins, and custom roles with overview access.
  const isAuthorized = user.role === 'seller' || user.role === 'admin' || user.role === 'super_admin' || hasPermission('overview', 'view');
  
  if (!isAuthorized) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 1. Define the Master Metadata Registry for all supported modules.
  // This registry provides the Icon, Label, and Path for each module key.
  const MODULE_METADATA: Record<string, { name: string; icon: any; path: string }> = {
    overview:     { name: 'Overview',        icon: LayoutDashboard, path: '/seller/dashboard' },
    products:     { name: 'My Products',     icon: Package,         path: '/seller/products' },
    orders:       { name: 'Orders',          icon: ShoppingBag,     path: '/seller/orders' },
    pricelist:    { name: 'Pricelists',      icon: FileText,        path: '/seller/pricelists' },
    promotions:   { name: 'Promotions',      icon: Sparkles,        path: '/seller/promotions' },
    coupons:      { name: 'Coupons',         icon: Ticket,          path: '/seller/coupons' },
    discounts:    { name: 'Discounts',       icon: Tag,             path: '/seller/discounts' },
    payments:     { name: 'Payments',        icon: CreditCard,      path: '/seller/payments' },
    invoices:     { name: 'Invoices',        icon: FileText,        path: '/seller/invoices' },
    ledger:       { name: 'Ledger',          icon: BookOpen,        path: '/seller/ledger' },
    bulk_upload:  { name: 'Bulk Upload',     icon: Package,         path: '/seller/bulk-upload' },
    analytics:    { name: 'Sales Analytics', icon: BarChart3,       path: '/seller/analytics' },
    shipping:     { name: 'Shipping',        icon: Truck,           path: '/seller/shipping' },
    system:       { name: 'Activity Logs',   icon: History,         path: '/seller/logs' },
    settings:     { name: 'Settings',        icon: Settings,        path: '/seller/settings' },
    attributes:   { name: 'Attributes',      icon: ListOrdered,     path: '/seller/attributes' },
    tax_rules:    { name: 'Tax Rules',       icon: FileText,        path: '/seller/taxes' },
    blogs:        { name: 'Blogs',           icon: BookOpen,        path: '/seller/blogs' },
    seo:          { name: 'SEO Manager',     icon: Globe,           path: '/seller/seo' },
  };

  // 2. Dynamically compute the menu items based on the user's active permissions.
  const menuItems = React.useMemo(() => {
    // Get the current user's role configuration from AuthContext
    const userRole = roles.find(r => r.id === user?.role);
    const activePermissions = userRole?.permissions || [];

    // Filter and map metadata to create the final menu list
    const dynamicItems = activePermissions
      .filter(p => MODULE_METADATA[p.module] && canView(p.module as Module))
      .map(p => ({
        ...MODULE_METADATA[p.module],
        module: p.module
      }));

    // Ensure 'Overview' is included if they have general dashboard access
    if (canView('overview') && !dynamicItems.some(i => i.module === 'overview')) {
      dynamicItems.unshift({ ...MODULE_METADATA.overview, module: 'overview' });
    }

    // Deduplicate items (in case multiple permission actions exist for the same module)
    return Array.from(new Map(dynamicItems.map(item => [item.module, item])).values());
  }, [user?.role, roles, canView]);

  console.log('[Dynamic Menu] Role:', user?.role, 'Modules:', menuItems.length);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-brand-dark/5 sticky top-0 h-screen z-40">
        <div className="p-10">
          <Link to="/" className="text-3xl font-serif font-bold tracking-[0.2em] text-brand-dark group">
            TAYFA<span className="text-brand-gold group-hover:animate-pulse">.</span>
          </Link>
          <div className="flex items-center space-x-2 mt-2">
            <div className="w-4 h-[1px] bg-brand-gold/40" />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold">Seller Central</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1 overflow-y-auto custom-scrollbar pb-10">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all group ${
                  isActive
                    ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20 translate-x-1'
                    : 'text-brand-dark/40 hover:bg-brand-cream/40 hover:text-brand-dark'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <item.icon size={18} className={isActive ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'} />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="w-1 h-4 bg-brand-gold rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-brand-dark/5 bg-brand-cream/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-brand-dark/5 h-24 flex items-center justify-between px-8 sm:px-12 sticky top-0 z-30">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 bg-brand-cream/50 rounded-2xl text-brand-dark hover:bg-brand-cream transition-all"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="hidden lg:block">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-brand-cream/50 rounded-2xl text-brand-gold">
                {React.createElement(menuItems.find(i => i.path === location.pathname)?.icon || LayoutDashboard, { size: 24 })}
              </div>
              <div>
                <h1 className="text-2xl font-serif text-brand-dark capitalize">
                  {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                </h1>
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center bg-brand-cream/30 rounded-full px-4 py-2 border border-brand-dark/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/60">System Online</span>
            </div>

            <button className="p-3 text-brand-dark/40 hover:text-brand-gold hover:bg-brand-cream/50 rounded-2xl transition-all relative group">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-gold rounded-full border-2 border-white shadow-sm" />
            </button>

            <div className="flex items-center space-x-4 pl-6 border-l border-brand-dark/5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-brand-dark">{(user as any).businessName || user.fullName}</p>
                <p className="text-[9px] uppercase tracking-widest text-brand-gold font-bold">Premium Seller</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-cream border border-brand-gold/20 flex items-center justify-center text-brand-gold overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
                {(user as any).storeLogo ? (
                  <img src={(user as any).storeLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 sm:p-12 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col"
            >
              <div className="p-8 flex justify-between items-center">
                <span className="text-2xl font-serif font-bold tracking-widest">TAYFA</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-brand-dark">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'bg-brand-dark text-white'
                        : 'text-brand-dark/60 hover:bg-brand-cream/50'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-brand-dark/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
