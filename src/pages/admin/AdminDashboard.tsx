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
  const [timePeriod, setTimePeriod] = useState('30d');

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

  const statCards = [
    { 
      label: 'Total Customers', 
      value: stats?.customers || 0, 
      icon: Users, 
      change: '+12%', 
      isPositive: true,
      color: 'blue',
      trend: [30, 45, 35, 50, 40, 60, 55] 
    },
    { 
      label: 'Active Sellers', 
      value: stats?.sellers || 0, 
      icon: Package, 
      change: '+5%', 
      isPositive: true,
      color: 'emerald',
      trend: [10, 15, 12, 20, 18, 25, 22] 
    },
    { 
      label: 'Total Revenue', 
      value: stats?.revenue || 0, 
      icon: DollarSign, 
      change: '+18%', 
      isPositive: true,
      color: 'amber',
      trend: [5000, 7000, 6000, 8500, 8000, 9500, 10000] 
    },
    { 
      label: 'Total Orders', 
      value: stats?.orders || 0, 
      icon: ShoppingBag, 
      change: '+8%', 
      isPositive: true,
      color: 'rose',
      trend: [100, 120, 110, 140, 130, 160, 155] 
    },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl sm:text-5xl font-serif mb-2 sm:mb-4">Admin Overview</h1>
          <p className="text-xs sm:text-base text-brand-dark/60 font-sans">Welcome back, Administrator. Here's your platform's pulse.</p>
        </motion.div>
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
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`p-8 sm:p-10 group hover:border-brand-gold/30 transition-all relative overflow-hidden h-full ${
              stat.isPositive ? 'bg-gradient-to-br from-white to-emerald-50/30' : 'bg-gradient-to-br from-white to-rose-50/30'
            }`}>
              <div className="flex justify-between items-start mb-6 sm:mb-8 relative z-10">
                <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-${stat.color}-500/10 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge 
                    variant={stat.isPositive ? 'success' : 'danger'}
                    className="flex items-center text-[9px] sm:text-[10px] pr-3"
                  >
                    <div className={`w-1 h-1 rounded-full mr-2 animate-pulse ${stat.isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {stat.change}
                  </Badge>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-[#262626] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-2 sm:mb-3">{stat.label}</h3>
                <p className="text-3xl sm:text-4xl font-serif tracking-tighter text-brand-dark">
                  <Counter value={stat.value as number} isCurrency={stat.isCurrency} formatPrice={formatPrice} />
                </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Analytics Preview */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-12">
          <Card variant="default" className="p-0 border-brand-dark/10 shadow-lg shadow-brand-dark/5 overflow-hidden">
            <div className="p-8 sm:p-10 border-b border-brand-dark/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-12">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif text-brand-dark">Sales Performance</h2>
                  <p className="text-[8px] sm:text-[10px] text-brand-dark/60 uppercase tracking-[0.3em] font-bold mt-1">Platform-wide revenue metrics</p>
                </div>
                
                {/* Advanced Tab Switcher */}
                <div className="relative flex items-center bg-brand-cream/50 p-1.5 rounded-2xl border border-brand-dark/5">
                  <div className="absolute inset-y-1.5 bg-brand-dark rounded-xl shadow-lg transition-all duration-300 ease-out" 
                    style={{ 
                      width: 'calc(33.33% - 4px)', 
                      left: timePeriod === '7d' ? '6px' : timePeriod === '30d' ? '33.33%' : '66.66%',
                      transform: timePeriod === '30d' ? 'translateX(0)' : timePeriod === '1y' ? 'translateX(-6px)' : 'translateX(0)'
                    }} 
                  />
                  {['7d', '30d', '1y'].map((p) => (
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
                  <p className="text-[9px] font-bold text-brand-dark/40 uppercase tracking-widest">Total Revenue</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-serif text-brand-dark">{formatPrice(stats?.revenue || 0)}</p>
                    <span className="text-[10px] text-emerald-600 font-bold">+18.4%</span>
                  </div>
                </div>
                <div className="space-y-1 sm:border-x border-brand-dark/5 sm:px-8">
                  <p className="text-[9px] font-bold text-brand-dark/40 uppercase tracking-widest">Avg. Daily Sales</p>
                  <p className="text-2xl font-serif text-brand-dark">{formatPrice((stats?.revenue || 0) / 30)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-brand-dark/40 uppercase tracking-widest">Target Status</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-serif text-brand-dark">92%</p>
                    <div className="w-12 h-1 bg-brand-cream rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gold w-[92%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-[400px] w-full p-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.salesOverTime || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
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
                    tickFormatter={(value) => `$${value}`}
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
                                  <span className="text-[10px] font-mono font-bold text-white">{formatPrice(entry.value)}</span>
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
                    fill="url(#colorRevenue)" 
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
                    fill="url(#colorPrev)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

            {/* Orders by Status */}
            <Card className="p-8 sm:p-10 border-brand-dark/5 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-serif text-brand-dark">Orders by Status</h3>
                <div className="flex items-center space-x-1 text-emerald-600">
                  <ArrowUpRight size={14} />
                  <span className="text-[10px] font-bold">12% Growth</span>
                </div>
              </div>
              <div className="h-72 relative">
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
                          const total = (stats?.ordersByStatus || []).reduce((acc: number, curr: any) => acc + curr.count, 0);
                          const percent = ((data.count / total) * 100).toFixed(1);
                          return (
                            <div className="bg-brand-dark px-3 py-2 rounded-lg shadow-xl border border-white/10">
                              <p className="text-[10px] font-bold text-white uppercase tracking-widest">{data.status}: {data.count}</p>
                              <p className="text-[9px] text-brand-gold font-mono">{percent}% share</p>
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
                  <motion.p 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-serif text-brand-dark"
                  >
                    {stats?.orders || 0}
                  </motion.p>
                  <p className="text-[9px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mt-1">Total Orders</p>
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

            {/* Top Products */}
            <Card className="p-8 sm:p-10 border-brand-dark/5 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-serif text-brand-dark">Top Performing Products</h3>
                <Link to="/admin/products" className="text-[10px] font-bold text-brand-gold hover:text-brand-dark transition-colors uppercase tracking-widest">View All</Link>
              </div>
              <div className="space-y-8">
                {(stats?.topProducts || []).map((product: any, idx: number) => {
                  const revenuePercent = 100 - (idx * 15); // Mock revenue share
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + (idx * 0.1) }}
                      className="group relative"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-5">
                          {/* Rank Badge */}
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
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="px-2 py-0.5 rounded-md bg-brand-dark/5 text-[8px] font-bold text-brand-dark/40 uppercase tracking-widest">Category</span>
                                <span className="text-[9px] font-bold text-brand-dark/30">{product.totalSold} Units</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-brand-dark">{formatPrice(product.totalSold * 250)}</p>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">↑ 14%</p>
                        </div>
                      </div>
                      
                      {/* Revenue Progress Bar */}
                      <div className="pl-[104px] pr-2">
                        <div className="h-1 bg-brand-cream rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${revenuePercent}%` }}
                            transition={{ duration: 1.5, delay: 1.5 }}
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
          <Card variant="default" className="p-0 border-brand-dark/5 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 sm:p-10 border-b border-brand-dark/5 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-serif">Recent Orders</h2>
              <Link to="/admin/orders" className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors">View All</Link>
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
                  {/* Customer Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center text-[10px] font-bold shadow-lg transition-transform group-hover:scale-110">
                    {(order.customer || 'G').charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{order.customer || 'Guest User'}</p>
                        <p className="text-[10px] text-brand-dark/30 uppercase tracking-widest font-mono mt-0.5">#{order.id.slice(-8)}</p>
                      </div>
                      <span className="text-sm font-bold text-brand-dark">{formatPrice(order.total)}</span>
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

          {/* System Status */}
          <Card variant="default" className="p-8 sm:p-10 shadow-xl shadow-brand-dark/5 border-brand-dark/5">
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-serif">System Status</h2>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            </div>
            <div className="space-y-5 sm:space-y-7">
              {systemStatusData.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-brand-dark/5 hover:border-brand-gold/20 transition-all shadow-sm">
                  <div>
                    <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/60">{item.label}</h4>
                    <p className="text-[9px] sm:text-[10px] text-brand-dark/40 mt-1.5 font-mono">UPTIME: {item.uptime}</p>
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

          {/* New Activity Feed */}
          <Card variant="default" className="p-8 sm:p-10 border-brand-dark/5 shadow-sm">
            <h3 className="text-xl font-serif mb-8 text-brand-dark">Activity Timeline</h3>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-brand-dark/5">
              {[
                { label: 'New Seller Registered', time: '12m ago', type: 'user', color: 'bg-blue-500' },
                { label: 'Product Approved by Admin', time: '1h ago', type: 'product', color: 'bg-emerald-500' },
                { label: 'Bulk Upload Completed', time: '3h ago', type: 'system', color: 'bg-brand-gold' },
                { label: 'New Support Ticket', time: '5h ago', type: 'support', color: 'bg-rose-500' },
                { label: 'Payment Method Updated', time: '8h ago', type: 'finance', color: 'bg-amber-500' },
              ].map((activity, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex items-start space-x-6 relative group"
                >
                  <div className={`w-[23px] h-[23px] rounded-full ${activity.color} ring-4 ring-white shadow-sm flex-shrink-0 relative z-10 transition-transform group-hover:scale-125`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{activity.label}</p>
                    <p className="text-[9px] text-brand-dark/30 font-bold uppercase tracking-widest mt-1">{activity.time} — {activity.type}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const COLORS = ['#D4AF37', '#1A1A1A', '#8B7355', '#C0C0C0', '#E5E5E5'];

const STATUS_COLORS = {
  pending: '#F59E0B',    // amber
  processing: '#3B82F6', // blue
  shipped: '#8B5CF6',    // purple
  delivered: '#10B981',  // green
  cancelled: '#EF4444'   // red
};

const systemStatusData = [
  { label: 'API Server', status: 'operational', uptime: '99.9%' },
  { label: 'Database Cluster', status: 'operational', uptime: '100%' },
  { label: 'Storage Service', status: 'degraded', uptime: '98.5%' },
];

// Animated Counter Component
const Counter = ({ value, isCurrency, formatPrice }: { value: number, isCurrency?: boolean, formatPrice: (v: number) => string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
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
  }, [value]);

  return <span>{isCurrency ? formatPrice(displayValue) : displayValue.toLocaleString()}</span>;
};

export default AdminDashboard;
