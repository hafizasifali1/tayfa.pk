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
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [timePeriod, setTimePeriod] = React.useState('30d');
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

  const statCards = [
    { name: 'Total Revenue', value: stats?.revenue || 0, icon: DollarSign, change: '+12.5%', isPositive: true },
    { name: 'Total Orders', value: stats?.orders || 0, icon: ShoppingBag, change: '+5.2%', isPositive: true },
    { name: 'Low Stock Items', value: stats?.lowStock || 0, icon: Package, change: 'Alert', isPositive: false },
    { name: 'Top Selling', value: stats?.topProducts?.[0]?.name || 'None', icon: TrendingUp, change: 'Best', isPositive: true },
  ];

  const COLORS = ['#D4AF37', '#1A1A1A', '#8B7355', '#C0C0C0', '#E5E5E5'];

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
            <Card
              key={stat.name}
              title={stat.name}
              icon={stat.icon}
              delay={idx * 0.1}
              className="group hover:border-brand-gold/30 transition-all"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={80} />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`flex items-center text-[9px] font-bold px-2.5 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'} uppercase tracking-[0.15em]`}>
                  {stat.change}
                  {stat.isPositive ? <ArrowUpRight size={12} className="ml-1" /> : <ArrowDownRight size={12} className="ml-1" />}
                </div>
              </div>
              <div className="relative z-10">
                {typeof stat.value === 'number' ? (
                  <Price amount={stat.value} className="text-3xl sm:text-4xl font-serif text-brand-dark tracking-tighter" />
                ) : (
                  <h3 className="text-3xl sm:text-4xl font-serif text-brand-dark tracking-tighter truncate">{stat.value}</h3>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Order Status Distribution */}
          <Card 
            title="Order Status" 
            className="lg:col-span-1 p-8 sm:p-10"
          >
            <div className="h-64 mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.ordersByStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {(stats?.ordersByStatus || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {(stats?.ordersByStatus || []).map((entry: any, index: number) => (
                <div key={entry.status} className="flex items-center justify-between p-3 rounded-2xl bg-brand-cream/20 border border-brand-dark/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">{entry.status}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold">{entry.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Revenue Trends Chart */}
          <Card 
            title="Revenue Trends" 
            variant="premium" 
            className="lg:col-span-2 p-6 sm:p-10"
          >
            <div className="absolute top-6 sm:top-8 right-6 sm:right-8">
              <select 
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="bg-brand-cream/50 border-none rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-gold/20"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
              </select>
            </div>
            
            <div className="mt-8 sm:mt-10 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.salesOverTime || []}>
                  <defs>
                    <linearGradient id="colorRevenueSeller" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
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
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1A1A', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                    itemStyle={{ color: '#D4AF37' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#D4AF37" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenueSeller)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 p-6 sm:p-8 bg-brand-cream/30 rounded-2xl sm:rounded-[2.5rem] border border-brand-dark/5">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl text-brand-gold shadow-sm">
                  <CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Total Sold</p>
                  <p className="font-serif text-lg sm:text-xl">{stats?.orders || 0} Orders</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4 sm:border-x border-brand-dark/5 sm:px-8">
                <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl text-brand-gold shadow-sm">
                  <TrendingUp size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Growth</p>
                  <p className="font-serif text-lg sm:text-xl text-emerald-600">+18.4%</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl text-rose-500 shadow-sm">
                  <AlertCircle size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Low Stock</p>
                  <p className="font-serif text-lg sm:text-xl text-rose-500">{stats?.lowStock || 0} Items</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Recent Orders */}
          <Card title="Recent Orders" className="p-8 sm:p-10">
            <div className="space-y-4 mt-6">
              {(stats?.recentOrders || []).map((order: any) => (
                <div key={order.id} className="p-5 rounded-3xl bg-brand-cream/20 border border-brand-dark/5 hover:border-brand-gold/20 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-bold text-brand-dark">{order.customer || 'Guest'}</p>
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <Price amount={order.total} className="text-sm font-bold text-brand-dark" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock size={12} className="text-brand-dark/40" />
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant={order.status === 'delivered' ? 'success' : 'warning'} className="text-[9px]">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Products */}
          <Card title="Top Performing Products" className="p-8 sm:p-10">
            <div className="space-y-6 mt-6">
              {(stats?.topProducts || []).map((product: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between group p-4 rounded-2xl bg-brand-cream/20 border border-brand-dark/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xs font-bold text-brand-gold shadow-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark">{product.name}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Best Seller</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-dark">{product.totalSold}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Units Sold</p>
                  </div>
                </div>
              ))}
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

export default SellerDashboard;
