import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, Package, BarChart3, Shield, Settings,
  LogOut, Menu, X, Bell, Search, ChevronDown, Sparkles,
  Ticket, Tag, FileText, Globe, Layers, Award, CreditCard, Percent,
  ShoppingBag, BookOpen, Building, MessageSquare, Mail, ListOrdered,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import AccessDenied from '../../components/admin/AccessDenied';

/**
 * V3 — Cream Editorial sidebar
 * Drop-in replacement for the prior dark-gold AdminLayout.
 * Preserves: RBAC (canView), expanded-section persistence, collapsed rail,
 *            tooltip portal, mobile drawer, all module routing.
 */
const AdminLayout = () => {
  const { user, logout, canView, isAuthReady, refreshRoles } = useAuth();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [labelsVisible, setLabelsVisible] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') !== 'true';
  });
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [tooltip, setTooltip] = useState<{ label: string; y: number; isLogo?: boolean } | null>(null);
  const [menuQuery, setMenuQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_width');
    return saved ? parseInt(saved, 10) : 280;
  });
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        let newWidth = e.clientX;
        if (newWidth < 180) newWidth = 180;
        if (newWidth > 400) newWidth = 400;
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    if (!isSidebarCollapsed) {
      localStorage.setItem('admin_sidebar_width', sidebarWidth.toString());
    }
  }, [sidebarWidth, isSidebarCollapsed]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('admin_sidebar_expanded');
    return saved ? JSON.parse(saved) : {
      'Operations': true,
      'Reporting': false,
      'Configurations': false,
      'Settings': false,
    };
  });

  useEffect(() => {
    if (isAuthReady) {
      refreshRoles();
    }
  }, [isAuthReady]);

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
        { icon: Package, label: 'Products', path: '/admin/products', module: 'products' },
      ],
    },
    {
      label: 'Reporting',
      items: [
        { icon: BarChart3, label: 'Sales Analytics', path: '/admin/analytics', module: 'analytics' },
        { icon: BookOpen, label: 'Ledger', path: '/admin/ledger', module: 'ledger' },
        { icon: Sparkles, label: 'System Logs', path: '/admin/logs', module: 'system' },
      ],
    },
    {
      label: 'Configurations',
      items: [
        { icon: Award, label: 'Brands', path: '/admin/brands', module: 'products' },
        { icon: Layers, label: 'Categories', path: '/admin/categories', module: 'products' },
        { icon: ListOrdered, label: 'Attributes', path: '/admin/attributes', module: 'attributes' },
        { icon: Tag, label: 'Filters', path: '/admin/filters', module: 'products' },
        { icon: Globe, label: 'SEO Manager', path: '/admin/seo', module: 'seo' },
        { icon: Globe, label: 'Countries', path: '/admin/countries', module: 'settings' },
        { icon: CreditCard, label: 'Payment Methods', path: '/admin/payment-methods', module: 'payments' },
        { icon: Settings, label: 'Gateway Settings', path: '/admin/payment-settings', module: 'payments' },
        { icon: Percent, label: 'Tax Management', path: '/admin/taxes', module: 'tax_rules' },
      ],
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
        { icon: Mail, label: 'Email Settings', path: '/admin/email-settings', module: 'settings' },
        { icon: Settings, label: 'System Settings', path: '/admin/settings', module: 'settings' },
      ],
    },
  ];

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

  const isAuthorized =
    user.role === 'super_admin' ||
    user.role === 'admin' ||
    canView('overview') ||
    canView('rbac');

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-8">
        <AccessDenied requiredRole="administrator" />
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

  const toggleSidebar = () => {
    if (!isSidebarCollapsed) {
      setLabelsVisible(false);
      setTimeout(() => {
        setIsSidebarCollapsed(true);
        localStorage.setItem('admin_sidebar_collapsed', 'true');
      }, 160);
    } else {
      setIsSidebarCollapsed(false);
      localStorage.setItem('admin_sidebar_collapsed', 'false');
      setTimeout(() => setLabelsVisible(true), 280);
    }
  };

  // RBAC filter
  const filteredModules = modules
    .map(mod => ({
      ...mod,
      items: (mod.items || []).filter(item => canView(item.module as any)),
    }))
    .filter(mod => mod.items.length > 0);

  if (filteredModules.length === 0 && user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-8">
        <AccessDenied requiredRole="admin" />
      </div>
    );
  }

  // Menu search filter (applied to each module's items)
  const q = menuQuery.trim().toLowerCase();
  const searchedModules = q
    ? filteredModules
        .map(mod => ({ ...mod, items: mod.items.filter(i => i.label.toLowerCase().includes(q)) }))
        .filter(mod => mod.items.length > 0)
    : filteredModules;

  const allItems = filteredModules.flatMap(m => m.items);

  const isItemActive = (path: string) =>
    location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));

  return (
    <div className="h-screen bg-brand-cream flex overflow-hidden">
      {/* ============ Desktop Sidebar ============ */}
      <div
        className="hidden lg:flex shrink-0 bg-brand-cream-dark border-r border-brand-dark/5 relative group/sidebar"
        style={{
          width: isSidebarCollapsed ? 72 : sidebarWidth,
          minWidth: isSidebarCollapsed ? 72 : sidebarWidth,
          transition: isResizing ? 'none' : 'width 0.3s ease, min-width 0.3s ease',
        }}
      >
        {/* Drag handle */}
        {!isSidebarCollapsed && (
          <div
            onMouseDown={startResizing}
            className="absolute -right-[2px] top-0 bottom-0 w-[4px] cursor-col-resize z-50 transition-colors"
            style={{ touchAction: 'none' }}
          />
        )}
        <aside className="flex flex-col w-full text-brand-dark sticky top-0 h-screen overflow-y-auto overflow-x-hidden">

          {/* --- Logo / Toggle --- */}
          <div className="shrink-0">
            {isSidebarCollapsed ? (
              <div
                onClick={toggleSidebar}
                onMouseEnter={e => {
                  setIsLogoHovered(true);
                }}
                onMouseLeave={() => {
                  setIsLogoHovered(false);
                }}
                className="flex items-center justify-center w-full py-5 cursor-pointer text-brand-dark/60 hover:text-brand-dark transition-all group"
              >
                <div className="relative flex items-center justify-center">
                  <img 
                    src="/tayfa-icon.png" 
                    alt="TAYFA" 
                    className={`transition-all duration-300 ${isLogoHovered ? 'opacity-0 scale-50 rotate-12' : 'opacity-100 scale-100'}`}
                    style={{ width: 30, height: 'auto' }} 
                  />
                  <PanelLeftOpen 
                    size={20} 
                    className={`absolute transition-all duration-300 ${isLogoHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-50'}`}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-6 py-6">
                <Link to="/" className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <img src="/Tayfa.png" alt="TAYFA" className="h-16 w-auto" />
                </Link>
                <button
                  onClick={toggleSidebar}
                  className="p-2.5 rounded-xl text-brand-dark/35 hover:text-brand-dark hover:bg-brand-dark/5 transition-all group"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* --- Menu search (expanded only) --- */}
          {!isSidebarCollapsed && (
            <div className="px-4 pt-1 pb-1"
              style={{ opacity: labelsVisible ? 1 : 0, transition: 'opacity 0.15s ease' }}>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-brand-dark/6 rounded-xl">
                <Search size={13} className="text-brand-dark/40" />
                <input
                  value={menuQuery}
                  onChange={e => setMenuQuery(e.target.value)}
                  placeholder="Search menu"
                  className="flex-1 bg-transparent border-0 outline-none p-0 text-xs text-brand-dark placeholder:text-brand-dark/35"
                />

              </div>
            </div>
          )}

          {/* --- Nav --- */}
          <nav
            className="grow overflow-y-auto"
            style={{ padding: isSidebarCollapsed ? '10px 6px' : '8px 12px 12px' }}
          >
            {isSidebarCollapsed ? (
              // Collapsed rail
              <div className="flex flex-col items-center gap-1">
                {allItems.map(item => {
                  const active = isItemActive(item.path);
                  return (
                    <div
                      key={item.path}
                      className="w-full"
                      onMouseEnter={e => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setTooltip({ label: item.label, y: rect.top + rect.height / 2 });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center justify-center p-3 rounded-xl transition-all ${
                          active
                            ? 'bg-brand-dark text-white shadow-[0_6px_14px_rgba(26,26,26,0.18)]'
                            : 'text-brand-dark/55 hover:bg-brand-dark/5 hover:text-brand-dark'
                        }`}
                      >
                        <item.icon size={20} className={active ? 'text-brand-gold' : ''} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Expanded list
              <div className="space-y-2">
                {searchedModules.map(mod => {
                  const isExpanded = q ? true : (expandedSections[mod.label] ?? true);
                  return (
                    <div key={mod.label}>
                      <button
                        onClick={() => !q && toggleSection(mod.label)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-brand-dark/55 hover:text-brand-dark"
                        style={{ opacity: labelsVisible ? 1 : 0, transition: 'opacity 0.15s ease' }}
                      >
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em]">{mod.label}</h3>
                        <motion.div
                          animate={{ rotate: isExpanded ? 0 : -90 }}
                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        >
                          <ChevronDown size={12} />
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: { type: 'spring', damping: 25, stiffness: 220 },
                              opacity: { duration: 0.18 },
                            }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              {mod.items.map(item => {
                                const active = isItemActive(item.path);
                                return (
                                  <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                      active
                                        ? 'bg-brand-dark text-white'
                                        : 'text-brand-dark/75 hover:bg-brand-dark/5 hover:text-brand-dark'
                                    }`}
                                  >
                                    <item.icon
                                      size={16}
                                      className={active ? 'text-brand-gold' : 'text-brand-dark/55'}
                                    />
                                    <span
                                      className="flex-1 text-[13px] whitespace-nowrap overflow-hidden"
                                      style={{
                                        fontWeight: active ? 600 : 500,
                                        opacity: labelsVisible ? 1 : 0,
                                        transition: 'opacity 0.15s ease',
                                      }}
                                    >
                                      {item.label}
                                    </span>
                                    {active && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {q && searchedModules.length === 0 && (
                  <div className="px-3 py-6 text-center text-[12px] text-brand-dark/45">
                    No matches for "{menuQuery}"
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* --- User chip + logout --- */}
          <div
            className="shrink-0 border-t border-brand-dark/5"
            style={{ padding: isSidebarCollapsed ? '8px 6px' : '8px 12px', transition: 'padding 0.3s ease' }}
          >
            {isSidebarCollapsed ? (
              <div
                onMouseEnter={e => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setTooltip({ label: 'Logout', y: rect.top + rect.height / 2 });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center p-3 rounded-xl text-brand-dark/45 hover:text-rose-500 hover:bg-rose-500/8 transition-all"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={logout}
                style={{ opacity: labelsVisible ? 1 : 0, transition: 'opacity 0.15s ease' }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-brand-dark/50 hover:text-rose-500 hover:bg-rose-500/5 transition-all group"
              >
                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[13px] font-semibold tracking-wide">Sign out</span>
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Collapsed-rail tooltip portal */}
      {tooltip && isSidebarCollapsed && createPortal(
        <div
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: 80,
            transform: 'translateY(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className={`px-3 py-1.5 bg-brand-dark text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-lg whitespace-nowrap shadow-2xl transition-all duration-300 ${tooltip.isLogo ? 'bg-white border border-brand-dark/10 !p-4' : ''}`}
        >
          {tooltip.isLogo ? (
            <img src="/Tayfa.png" alt="TAYFA" className="h-7 w-auto brightness-0" />
          ) : (
            <>
              <div
                style={{
                  position: 'absolute',
                  right: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 0,
                  height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderRight: '5px solid #1A1A1A',
                }}
              />
              {tooltip.label}
            </>
          )}
        </div>,
        document.body
      )}

      {/* ============ Main ============ */}
      <main className="grow flex flex-col h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Header */}
        <header className="bg-white/85 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-between gap-6">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-brand-dark hover:text-brand-gold transition-colors bg-brand-cream-dark rounded-xl"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="ml-4">
              <img src="/Tayfa.png" alt="TAYFA" className="h-8 w-auto" />
            </Link>
          </div>



          <div className="flex items-center gap-4 ml-auto">
            <button className="p-3 bg-brand-cream-dark text-brand-dark rounded-2xl hover:bg-brand-gold hover:text-white transition-all relative group">
              <Bell size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="w-px h-9 bg-brand-dark/6 mx-1" />

            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold leading-none uppercase tracking-wider text-brand-dark">
                  {user.fullName}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold group-hover:bg-brand-gold transition-all">
                {(user.fullName || '?').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="px-3 pt-3 pb-6 sm:px-5 sm:pt-4 sm:pb-8 lg:px-6 lg:pt-4 lg:pb-8 grow">
          <Outlet />
        </div>
      </main>

      {/* ============ Mobile drawer ============ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-60"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-brand-cream-dark text-brand-dark z-70 flex flex-col"
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-brand-dark/6">
                <Link to="/" className="inline-block">
                  <img src="/Tayfa.png" alt="TAYFA" className="h-9 w-auto" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-brand-dark/55 hover:text-brand-dark rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="grow overflow-y-auto p-3 space-y-3">
                {filteredModules.map(mod => (
                  <div key={mod.label} className="space-y-1">
                    <h3 className="px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-dark/50">
                      {mod.label}
                    </h3>
                    {mod.items.map(item => {
                      const active = isItemActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                            active
                              ? 'bg-brand-dark text-white'
                              : 'text-brand-dark/75 hover:bg-brand-dark/5 hover:text-brand-dark'
                          }`}
                        >
                          <item.icon size={17} className={active ? 'text-brand-gold' : 'text-brand-dark/55'} />
                          <span className="text-[13px] font-medium">{item.label}</span>
                          {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="border-t border-brand-dark/6 p-3">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-rose-500 hover:bg-rose-500/8 transition-all"
                >
                  <LogOut size={17} />
                  <span className="text-[13px] font-semibold">Sign out</span>
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
