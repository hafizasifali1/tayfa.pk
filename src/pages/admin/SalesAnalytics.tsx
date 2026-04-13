import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, ArrowUpRight, ArrowDownRight, Calendar, Download, Filter } from 'lucide-react';
import Price from '../../components/common/Price';

const SalesAnalytics = () => {
  const stats = [
    { label: 'Total Revenue', value: 124500, icon: DollarSign, change: '+12.5%', isPositive: true },
    { label: 'Total Orders', value: 1240, icon: ShoppingBag, change: '+8.2%', isPositive: true },
    { label: 'Average Order Value', value: 100.40, icon: TrendingUp, change: '-2.1%', isPositive: false },
    { label: 'Conversion Rate', value: '3.2%', icon: Users, change: '+0.5%', isPositive: true },
  ];

  const topSellers = [
    { name: 'Luxe Threads', sales: 45200, orders: 320, growth: '+15%' },
    { name: 'Urban Chic', sales: 38400, orders: 280, growth: '+12%' },
    { name: 'Heritage Wear', sales: 31200, orders: 210, growth: '+5%' },
    { name: 'Modern Style', sales: 28900, orders: 195, growth: '+8%' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif mb-2">Sales Analytics</h1>
          <p className="text-brand-dark/60">Comprehensive insights into your platform's financial performance.</p>
        </div>
        <div className="flex space-x-4">
          <button className="bg-white border border-brand-dark/10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-cream transition-colors flex items-center space-x-2">
            <Download size={16} />
            <span>Download Report</span>
          </button>
          <button className="bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center space-x-2">
            <Calendar size={16} />
            <span>Last 30 Days</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-brand-cream text-brand-dark">
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center text-xs font-bold ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.change} {stat.isPositive ? <ArrowUpRight size={12} className="ml-1" /> : <ArrowDownRight size={12} className="ml-1" />}
              </div>
            </div>
            <h3 className="text-brand-dark/40 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
            {typeof stat.value === 'number' ? (
              <Price amount={stat.value} className="text-2xl font-serif" />
            ) : (
              <p className="text-2xl font-serif">{stat.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-2xl font-serif">Revenue Overview</h2>
              <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold">Monthly performance</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-brand-dark text-white rounded-full text-[10px] font-bold uppercase tracking-widest">Revenue</button>
              <button className="px-4 py-2 bg-brand-cream text-brand-dark rounded-full text-[10px] font-bold uppercase tracking-widest">Orders</button>
            </div>
          </div>
          <div className="h-80 flex items-end justify-between space-x-4">
            {[60, 40, 80, 50, 90, 70, 100, 85, 65, 75, 55, 95].map((height, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-brand-gold/20 group-hover:bg-brand-gold rounded-t-xl transition-all duration-500"
                />
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-[10px] px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl z-10 whitespace-nowrap">
                  <Price amount={height * 1000} />
                </div>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 text-center">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm">
          <h2 className="text-2xl font-serif mb-8">Top Performing Sellers</h2>
          <div className="space-y-6">
            {topSellers.map((seller, idx) => (
              <div key={seller.name} className="flex items-center justify-between p-4 rounded-2xl hover:bg-brand-cream/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-serif text-lg leading-none mb-1">{seller.name}</h4>
                    <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">{seller.orders} Orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <Price amount={seller.sales} className="text-sm font-bold block" />
                  <span className="text-[10px] font-bold text-emerald-600">{seller.growth}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 border-2 border-brand-dark/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-brand-dark hover:bg-brand-dark hover:text-white transition-all">
            View All Sellers
          </button>
        </div>
      </div>

      {/* Sales by Category */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-brand-dark text-white p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="text-xl font-serif mb-6">Sales by Category</h3>
          <div className="space-y-6">
            {[
              { label: 'Luxury Wear', value: 45, color: 'brand-gold' },
              { label: 'Pret-a-Porter', value: 30, color: 'blue-400' },
              { label: 'Unstitched', value: 25, color: 'emerald-400' },
            ].map((cat) => (
              <div key={cat.label} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span>{cat.label}</span>
                  <span>{cat.value}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.value}%` }}
                    className={`h-full bg-${cat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif">Recent Transactions</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-brand-dark/5 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-cream flex items-center justify-center text-brand-dark">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Order #ORD-2026-00{i}</h4>
                    <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">2 items • 2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <Price amount={250 + i * 50} className="text-sm font-bold block" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Paid</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
