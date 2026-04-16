import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Price from '../../components/common/Price';
import axios from 'axios';
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  Ticket,
  FileUp,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';


const SellerDashboard = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [timePeriod, setTimePeriod] = useState('30d');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);
        const [statsRes, productsRes] = await Promise.all([
          axios.get(`/api/dashboard/seller/stats?sellerId=${user.id}`),
          axios.get(`/api/products?sellerId=${user.id}`)
        ]);
        setStats(statsRes.data);
        
        if (Array.isArray(productsRes.data)) {
          setProducts(productsRes.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const sellerProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    let filtered = products;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    return filtered;
  }, [products, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full"
        />
        <p className="text-brand-dark/40 font-bold uppercase tracking-[0.2em] text-[10px]">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
          <AlertCircle size={40} />
        </div>
        <h3 className="text-2xl font-serif text-brand-dark mb-3">Dashboard Error</h3>
        <p className="text-brand-dark/60 mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-brand-dark text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    { 
      name: 'Total Revenue', 
      value: stats?.revenue || 0, 
      icon: DollarSign, 
      isCurrency: true,
      change: '+12.5%',
      isPositive: true,
      color: 'gold',
      trend: [4000, 5500, 4800, 6200, 5900, 7500, 8200]
    },
    { 
      name: 'Active Products', 
      value: products.filter(p => p.status === 'published').length, 
      icon: Package, 
      change: '+3',
      isPositive: true,
      color: 'dark',
      trend: [42, 43, 43, 44, 45, 45, 46]
    },
    { 
      name: 'Total Orders', 
      value: stats?.orders || 0, 
      icon: ShoppingBag, 
      change: '+8.2%',
      isPositive: true,
      color: 'gold',
      trend: [120, 145, 130, 160, 155, 180, 175]
    },
    { 
      name: 'Growth Rate', 
      value: '24.8%', 
      icon: TrendingUp, 
      change: '+4.1%',
      isPositive: true,
      color: 'dark',
      trend: [18, 20, 19, 22, 23, 24, 25]
    },
  ];

  const quickActions = [
    { name: 'Add Product', icon: PlusCircle, path: '/seller/add-product', variant: 'primary' as const },
    { name: 'Bulk Upload', icon: FileUp, path: '/seller/bulk-upload', variant: 'outline' as const },
    { name: 'Create Coupon', icon: Ticket, path: '/seller/coupons', variant: 'outline' as const },
    { name: 'Manage Pricelist', icon: FileText, path: '/seller/pricelists', variant: 'outline' as const },
  ];

  const recentOrders = Array.isArray(stats?.recentOrders) ? stats.recentOrders : [];

  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(prev => Array.isArray(prev) ? prev.filter(p => p.id !== id) : []);
      setNotification({ type: 'success', message: 'Product deleted successfully' });
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setNotification({ type: 'error', message: 'Failed to delete product' });
    }
  };

  const toggleStatus = async (product: any) => {
    const newStatus = product.status === 'published' ? 'archived' : 'published';
    try {
      const response = await axios.put(`/api/products/${product.id}`, { status: newStatus });
      setProducts(prev => Array.isArray(prev) ? prev.map(p => p.id === product.id ? response.data : p) : []);
      setNotification({ type: 'success', message: `Product ${newStatus === 'published' ? 'published' : 'archived'} successfully` });
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification({ type: 'error', message: 'Failed to update status' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-[2rem] border border-brand-dark/5 shadow-sm">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 className="text-xl font-serif text-brand-dark mb-2">Error Loading Dashboard</h3>
        <p className="text-brand-dark/60 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-brand-dark text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center space-x-3 ${
              notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold tracking-wide">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Product?"
        subtitle="This action cannot be undone."
        icon={AlertCircle}
        variant="danger"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => deleteProduct(confirmDelete!)}>Delete</Button>
          </>
        }
      >
        <p className="text-brand-dark/60">
          This product will be permanently removed from your inventory and all associated data will be lost.
        </p>
      </Modal>

      <div className="space-y-10">
        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-brand-dark/5">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-2 sm:mb-4 block">Store Overview</span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-brand-dark leading-tight mb-4">
                Welcome back, <br />
                <span className="italic">{(user as any).businessName || user?.fullName}</span>
              </h1>
              <p className="text-brand-dark/60 text-base sm:text-lg font-light leading-relaxed">
                Your store is performing <span className="text-emerald-600 font-medium">12% better</span> than last week. 
                You have <span className="text-brand-dark font-medium">5 new orders</span> waiting for processing.
              </p>
            </motion.div>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {quickActions.map((action, idx) => (
              <Link key={action.name} to={action.path} className="flex-grow sm:flex-grow-0">
                <Button variant={action.variant} icon={action.icon} className="w-full text-[10px] sm:text-sm px-4 sm:px-6">
                  {action.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className={`p-8 sm:p-10 group hover:border-brand-gold/30 transition-all relative overflow-hidden h-full ${
                  stat.isPositive ? 'bg-gradient-to-br from-white to-emerald-50/30' : 'bg-gradient-to-br from-white to-rose-50/30'
                }`}
              >
                <div className="flex justify-between items-start mb-6 sm:mb-8 relative z-10">
                  <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-${stat.color}-500/10 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                  <Badge 
                    variant={stat.isPositive ? 'success' : 'danger'}
                    className="flex items-center text-[9px] sm:text-[10px] pr-3"
                  >
                    <div className={`w-1 h-1 rounded-full mr-2 animate-pulse ${stat.isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {stat.change}
                  </Badge>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-[#262626] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-2 sm:mb-3">{stat.name}</h3>
                  <div className="text-3xl sm:text-4xl font-serif tracking-tighter text-brand-dark">
                    <Counter value={stat.value} isCurrency={stat.isCurrency} />
                  </div>
                </div>

                {/* Sparkline */}
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 group-hover:opacity-40 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stat.trend.map((val, i) => ({ val, i }))}>
                      <Area 
                        type="monotone" 
                        dataKey="val" 
                        stroke={stat.isPositive ? '#10B981' : '#EF4444'} 
                        strokeWidth={2}
                        fill={stat.isPositive ? '#10B981' : '#EF4444'}
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Order Status Distribution */}
          <Card 
            className="lg:col-span-1 p-8 sm:p-10 border-brand-dark/5 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-serif text-brand-dark">Orders by Status</h3>
            </div>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.ordersByStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="status"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {(stats?.ordersByStatus || []).map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.status.toLowerCase() as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-brand-dark px-3 py-2 rounded-lg shadow-xl border border-white/10">
                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">{data.status}: {data.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-4xl font-serif text-brand-dark leading-none">{stats?.orders || 0}</p>
                <p className="text-[8px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mt-1 text-center">Orders<br/>This Period</p>
              </div>
            </div>

            {/* Advanced Legend */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {(stats?.ordersByStatus || []).map((entry: any, index: number) => (
                <div key={entry.status} className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-cream/40 border border-brand-dark/5 hover:bg-white transition-all cursor-default">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.status.toLowerCase() as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length] }} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/60">{entry.status}</span>
                  <span className="text-[9px] font-mono font-bold text-brand-dark">{entry.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Revenue Trends Chart */}
          <Card 
            className="lg:col-span-2 p-0 border-brand-dark/10 shadow-lg shadow-brand-dark/5 overflow-hidden"
          >
            <div className="p-8 sm:p-10 border-b border-brand-dark/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-12">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif text-brand-dark">Revenue Trends</h2>
                  <p className="text-[8px] sm:text-[10px] text-brand-dark/60 uppercase tracking-[0.3em] font-bold mt-1">Earnings performance overview</p>
                </div>
                
                {/* Advanced Tab Switcher */}
                <div className="relative flex items-center bg-brand-cream/50 p-1.5 rounded-2xl border border-brand-dark/5">
                  <div className="absolute inset-y-1.5 bg-brand-dark rounded-xl shadow-lg transition-all duration-300 ease-out" 
                    style={{ 
                      width: 'calc(33.33% - 4px)', 
                      left: timePeriod === '7d' ? '6px' : timePeriod === '30d' ? '33.33%' : '66.66%',
                      transform: timePeriod === '30d' ? 'translateX(0)' : timePeriod === '90d' ? 'translateX(-6px)' : 'translateX(0)'
                    }} 
                  />
                  {['7d', '30d', '90d'].map((p) => (
                    <button 
                      key={p} 
                      onClick={() => setTimePeriod(p)}
                      className={`relative z-10 px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${p === timePeriod ? 'text-white' : 'text-brand-dark/40 hover:text-brand-dark'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Stats Above Chart */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-brand-dark/40 uppercase tracking-widest">Gross Revenue</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-serif text-brand-dark"><Price amount={stats?.revenue || 0} /></p>
                    <span className="text-[10px] text-emerald-600 font-bold">+18.4%</span>
                  </div>
                </div>
                <div className="space-y-1 sm:border-x border-brand-dark/5 sm:px-8">
                  <p className="text-[9px] font-bold text-brand-dark/40 uppercase tracking-widest">Avg. Daily Sales</p>
                  <p className="text-2xl font-serif text-brand-dark"><Price amount={(stats?.revenue || 0) / 30} /></p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-brand-dark/40 uppercase tracking-widest">Market Share</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-serif text-brand-dark">12.4%</p>
                    <div className="w-12 h-1 bg-brand-cream rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gold w-[65%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-[400px] w-full p-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.salesOverTime || []}>
                  <defs>
                    <linearGradient id="colorRevenueSeller" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPrevSeller" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A05" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#1A1A1A40', fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#1A1A1A40', fontWeight: 'bold' }}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-brand-dark p-4 rounded-xl shadow-2xl border border-brand-gold/20 backdrop-blur-xl">
                            <p className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-3">{label}</p>
                            <div className="space-y-2">
                              {payload.map((entry: any, index: number) => (
                                <div key={index} className="flex items-center justify-between space-x-8">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{entry.name}</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-white"><Price amount={entry.value} /></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Current Period"
                    stroke="#C9A84C" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenueSeller)" 
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={(d: any) => d.revenue * 0.85} // Mock previous period
                    name="Previous Period"
                    stroke="#1A1A1A20" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorPrevSeller)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Recent Orders */}
          <Card className="p-0 border-brand-dark/5 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 sm:p-10 border-b border-brand-dark/5">
              <h2 className="text-xl sm:text-2xl font-serif text-brand-dark">Recent Orders</h2>
            </div>
            <div className="flex-grow overflow-y-auto">
              {(stats?.recentOrders || []).map((order: any, idx: number) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-start space-x-5 px-8 sm:px-10 py-6 border-b border-brand-dark/5 last:border-0 hover:bg-brand-cream/20 transition-all cursor-pointer group ${idx % 2 === 0 ? 'bg-white' : 'bg-brand-cream/5'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center text-[10px] font-bold shadow-lg transition-transform group-hover:scale-110">
                    {(order.customer || 'G').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{order.customer || 'Guest User'}</p>
                        <p className="text-[9px] text-brand-dark/30 uppercase tracking-widest font-mono mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">#{order.id}</p>
                      </div>
                      <Price amount={order.total} className="text-sm font-bold text-brand-dark" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {order.status}
                      </div>
                      <span className="text-[9px] text-brand-dark/30 font-bold italic">
                        2 hours ago
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Top Products */}
          <Card className="p-8 sm:p-10 border-brand-dark/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-serif text-brand-dark">Top Performing Products</h3>
            </div>
            <div className="space-y-8">
              {(stats?.topProducts || []).map((product: any, idx: number) => {
                const revenuePercent = 100 - (idx * 15);
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                    className="group relative"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-110 ${
                          idx === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                          idx === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                          idx === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                          'bg-brand-cream text-brand-dark/40'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-brand-cream overflow-hidden border border-brand-dark/10 group-hover:border-brand-gold/50 transition-colors">
                            <img 
                              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${product.name}`} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{product.name}</p>
                            <span className="text-[9px] font-bold text-brand-dark/30 uppercase tracking-widest">{product.totalSold} Units Sold</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand-dark"><Price amount={product.totalSold * 250} /></p>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">↑ 14%</p>
                      </div>
                    </div>
                    <div className="pl-[104px] pr-2">
                      <div className="h-1 bg-brand-cream rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${revenuePercent}%` }}
                          transition={{ duration: 1.5, delay: 1 }}
                          className="h-full bg-gradient-to-r from-brand-gold/60 to-brand-gold"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 -mx-4 -my-2 rounded-2xl bg-brand-gold/0 group-hover:bg-brand-gold/5 transition-all pointer-events-none" />
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Inventory Overview */}
        <div className="card-premium overflow-hidden">
          <div className="p-8 sm:p-10 border-b border-brand-dark/5 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-dark">Inventory Overview</h2>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 mt-2">Manage your luxury collection</p>
            </div>
            <div className="flex items-center space-x-2 p-1.5 bg-brand-cream/50 rounded-full border border-brand-dark/5 overflow-x-auto no-scrollbar">
              {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-brand-dark text-white shadow-lg'
                      : 'text-brand-dark/40 hover:text-brand-dark'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <Table headers={['Product Details', 'Category', 'Price', 'Inventory', 'Status', 'Actions']}>
            {sellerProducts.length > 0 ? (
              sellerProducts.map((product) => (
                <tr key={product.id} className="hover:bg-brand-cream/5 transition-colors group">
                  <td className="px-6 py-6 sm:px-10 sm:py-8">
                    <div className="flex items-center space-x-4 sm:space-x-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl overflow-hidden border border-brand-dark/5 shadow-sm flex-shrink-0">
                        <img src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-bold text-brand-dark truncate">{product.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-brand-dark/40 uppercase tracking-[0.2em] font-bold truncate">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 sm:px-10 sm:py-8">
                    <span className="text-[10px] sm:text-xs font-medium text-brand-dark/60 uppercase tracking-[0.2em] whitespace-nowrap">
                      {product.parentCategory ? `${product.parentCategory} > ` : ''}{product.category}
                    </span>
                  </td>
                  <td className="px-6 py-6 sm:px-10 sm:py-8">
                    <Price amount={product.price} className="text-sm sm:text-base font-bold text-brand-dark" />
                  </td>
                  <td className="px-6 py-6 sm:px-10 sm:py-8">
                    <div className="flex flex-col space-y-2">
                      <span className={`text-[10px] sm:text-xs font-bold ${product.stock < 10 ? 'text-rose-500' : 'text-brand-dark/60'}`}>
                        {product.stock} Units
                      </span>
                      <div className="w-20 sm:w-28 h-1.5 bg-brand-cream rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${product.stock < 10 ? 'bg-rose-500' : 'bg-brand-gold'}`} 
                          style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 sm:px-10 sm:py-8">
                    <Badge variant={product.status === 'published' ? 'success' : product.status === 'archived' ? 'danger' : 'warning'} className="text-[9px] sm:text-[10px]">
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-6 sm:px-10 sm:py-8 text-right">
                    <div className="flex items-center justify-end space-x-2 sm:space-x-4">
                      <Link to={`/seller/edit-product/${product.id}`}>
                        <Button variant="ghost" size="icon" icon={FileText} title="Edit Product" className="w-10 h-10" />
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        icon={AlertCircle} 
                        onClick={() => toggleStatus(product)}
                        className={`w-10 h-10 ${product.status === 'published' ? 'text-rose-400 hover:text-rose-600' : 'text-emerald-400 hover:text-emerald-600'}`}
                        title={product.status === 'published' ? 'Archive Product' : 'Publish Product'}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        icon={PlusCircle} 
                        onClick={() => setConfirmDelete(product.id)}
                        className="w-10 h-10 text-rose-400 hover:text-rose-600 rotate-45"
                        title="Delete Product"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-10 py-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-6 text-brand-dark/20">
                    <Package size={80} />
                    <p className="text-xl font-serif italic">Your luxury collection is empty.</p>
                    <Link to="/seller/add-product" className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold hover:text-brand-dark transition-colors underline underline-offset-8">Add your first product</Link>
                  </div>
                </td>
              </tr>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
};

const COLORS = ['#D4AF37', '#1A1A1A', '#8B7355', '#C0C0C0', '#E5E5E5'];

const STATUS_COLORS = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444'
};

// Animated Counter Component
const Counter = ({ value, isCurrency }: { value: number | string, isCurrency?: boolean }) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = numericValue;
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [numericValue]);

  if (typeof value === 'string' && isNaN(Number(value))) return <span>{value}</span>;
  return <span>{isCurrency ? <Price amount={displayValue} /> : displayValue.toLocaleString()}</span>;
};

export default SellerDashboard;
