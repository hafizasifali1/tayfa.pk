import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useCurrency } from '../../context/CurrencyContext';
import { Users, Package, BarChart3, Shield, ArrowUpRight, TrendingUp, ShoppingBag, DollarSign, Lock, FileText, Settings as SettingsIcon, Activity, CreditCard, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/dashboard/admin/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Customers', value: stats?.customers || 0, icon: Users, change: '+12%', color: 'blue' },
    { label: 'Active Sellers', value: stats?.sellers || 0, icon: Package, change: '+5%', color: 'emerald' },
    { label: 'Total Revenue', value: formatPrice(stats?.revenue || 0), icon: DollarSign, change: '+18%', color: 'amber' },
    { label: 'Total Orders', value: stats?.orders || 0, icon: ShoppingBag, change: '+8%', color: 'rose' },
  ];

  const systemStatus = [
    { label: 'API Server', status: 'operational', uptime: '99.9%' },
    { label: 'Database', status: 'operational', uptime: '100%' },
    { label: 'Storage', status: 'operational', uptime: '99.8%' },
    { label: 'Payment Gateway', status: 'warning', uptime: '98.5%' },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'registered as a seller', time: '2 hours ago', type: 'user' },
    { id: 2, user: 'Maria Garcia', action: 'uploaded a new product', time: '4 hours ago', type: 'product' },
    { id: 3, user: 'Admin', action: 'approved product #4521', time: '5 hours ago', type: 'admin' },
    { id: 4, user: 'David Smith', action: 'requested a withdrawal', time: '1 day ago', type: 'finance' },
  ];

  const COLORS = ['#D4AF37', '#1A1A1A', '#8B7355', '#C0C0C0', '#E5E5E5'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
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
        <Button variant="primary" onClick={() => window.location.reload()}>Retry Loading</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-serif mb-2 sm:mb-4">Admin Overview</h1>
          <p className="text-xs sm:text-base text-brand-dark/60 font-sans">Welcome back, Administrator. Here's your platform's pulse.</p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Button variant="outline" icon={FileText} className="text-[10px] sm:text-sm px-4 sm:px-6">
            Export
          </Button>
          <Link to="/admin/settings" className="flex-grow sm:flex-grow-0">
            <Button variant="primary" icon={SettingsIcon} className="w-full text-[10px] sm:text-sm px-4 sm:px-6">
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Card key={stat.label} className="p-8 sm:p-10 group hover:border-brand-gold/30 transition-all">
            <div className="flex justify-between items-start mb-6 sm:mb-8">
              <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-${stat.color}-500/10 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <Badge 
                variant={stat.change.startsWith('+') ? 'success' : 'danger'}
                className="flex items-center text-[9px] sm:text-[10px]"
              >
                {stat.change} <ArrowUpRight size={12} className="ml-1" />
              </Badge>
            </div>
            <h3 className="text-brand-dark/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-2 sm:mb-3">{stat.label}</h3>
            <p className="text-3xl sm:text-4xl font-serif tracking-tighter text-brand-dark">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Analytics Preview */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-12">
          <Card variant="default" className="p-6 sm:p-10 border-brand-dark/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif">Sales Performance</h2>
                <p className="text-[8px] sm:text-[10px] text-brand-dark/40 uppercase tracking-[0.2em] font-bold mt-1">Platform-wide revenue metrics (Last 30 Days)</p>
              </div>
              <div className="flex items-center bg-brand-cream/30 p-1 rounded-full border border-brand-dark/5">
                {['7d', '30d', '1y'].map((p) => (
                  <button key={p} className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${p === '30d' ? 'bg-brand-dark text-white shadow-lg' : 'text-brand-dark/40 hover:text-brand-dark'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.salesOverTime || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Orders by Status */}
            <Card className="p-8 sm:p-10">
              <h3 className="text-xl font-serif mb-6">Orders by Status</h3>
              <div className="h-64">
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
              <div className="mt-4 space-y-2">
                {(stats?.ordersByStatus || []).map((entry: any, index: number) => (
                  <div key={entry.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">{entry.status}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold">{entry.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Products */}
            <Card className="p-8 sm:p-10">
              <h3 className="text-xl font-serif mb-6">Top Products</h3>
              <div className="space-y-6">
                {(stats?.topProducts || []).map((product: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-brand-cream flex items-center justify-center text-[10px] font-bold text-brand-gold border border-brand-dark/5 group-hover:bg-brand-gold group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      <span className="text-[11px] font-bold text-brand-dark truncate max-w-[120px]">{product.name}</span>
                    </div>
                    <Badge variant="success" className="text-[9px]">{product.totalSold} Sold</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { to: '/admin/users', icon: Users, label: 'Users', color: 'blue' },
              { to: '/admin/orders', icon: ShoppingBag, label: 'Orders', color: 'amber' },
              { to: '/admin/payments', icon: CreditCard, label: 'Payments', color: 'emerald' },
              { to: '/admin/invoices', icon: FileText, label: 'Invoices', color: 'rose' },
            ].map((link) => (
              <Link key={link.label} to={link.to}>
                <div className="card-premium p-6 sm:p-8 flex flex-col items-center text-center space-y-4 sm:space-y-5 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-gold/5 transition-all group h-full">
                  <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-${link.color}-500/10 text-${link.color}-600 group-hover:bg-brand-gold group-hover:text-white transition-all`}>
                    <link.icon size={24} />
                  </div>
                  <h3 className="font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-brand-dark/60">{link.label}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-12">
          {/* Recent Orders */}
          <Card variant="default" className="p-6 sm:p-10 border-brand-dark/5 overflow-hidden">
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-serif">Recent Orders</h2>
              <Link to="/admin/orders" className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors">View All</Link>
            </div>
            <div className="space-y-0 -mx-6 sm:-mx-10">
              {(stats?.recentOrders || []).map((order: any) => (
                <div key={order.id} className="flex items-start space-x-4 sm:space-x-5 px-6 sm:px-10 py-4 sm:py-6 border-b border-brand-dark/5 last:border-0 hover:bg-brand-cream/20 transition-colors cursor-pointer group">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 bg-brand-cream/50 text-brand-gold`}>
                    <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] sm:text-xs leading-relaxed text-brand-dark/80">
                        <span className="font-bold text-brand-dark">{order.customer || 'Guest'}</span>
                      </p>
                      <span className="text-[10px] font-bold text-brand-dark">{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <Badge variant={order.status === 'delivered' ? 'success' : 'warning'} className="text-[8px]">
                        {order.status}
                      </Badge>
                      <span className="text-[8px] sm:text-[9px] text-brand-dark/30 uppercase tracking-[0.2em] font-bold font-mono">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* System Status */}
          <Card variant="default" className="p-8 sm:p-10">
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-serif">System Status</h2>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            </div>
            <div className="space-y-5 sm:space-y-7">
              {systemStatus.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-brand-cream/20 border border-brand-dark/5 hover:border-brand-gold/20 transition-all">
                  <div>
                    <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">{item.label}</h4>
                    <p className="text-[9px] sm:text-[10px] text-brand-dark/20 mt-1.5 font-mono">UPTIME: {item.uptime}</p>
                  </div>
                  <Badge variant={item.status === 'operational' ? 'success' : 'warning'} className="text-[9px] sm:text-[10px]">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" fullWidth className="mt-8 sm:mt-10 group" icon={<Activity size={18} className="group-hover:rotate-12 transition-transform" />}>
              Platform Health
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
