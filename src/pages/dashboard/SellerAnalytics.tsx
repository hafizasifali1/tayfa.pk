import React from 'react';
import { 
  BarChart3, TrendingUp, Users, ShoppingBag, 
  ArrowUpRight, ArrowDownRight, Calendar, Download,
  Filter, PieChart, Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import Price from '../../components/common/Price';

const SellerAnalytics = () => {
  const stats = [
    { label: 'Total Revenue', value: 45250.00, change: '+12.5%', trend: 'up', icon: TrendingUp },
    { label: 'Total Orders', value: 124, change: '+8.2%', trend: 'up', icon: ShoppingBag },
    { label: 'Avg. Order Value', value: 365.00, change: '-2.4%', trend: 'down', icon: Activity },
    { label: 'Conversion Rate', value: '3.2%', change: '+0.5%', trend: 'up', icon: Users },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2 tracking-tight">Sales Analytics</h1>
          <p className="text-brand-dark/40 text-xs font-mono uppercase tracking-[0.2em]">Performance_Metrics_v2.0</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-4 bg-white border border-brand-dark/5 rounded-2xl text-brand-dark/60 hover:text-brand-gold transition-all shadow-sm">
            <Calendar size={20} />
          </button>
          <button className="bg-brand-dark text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-gold transition-all flex items-center space-x-3 shadow-xl shadow-brand-dark/10">
            <Download size={16} />
            <span>Export_Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-brand-dark/5 shadow-sm group hover:border-brand-gold/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-2xl bg-brand-cream/50 text-brand-gold group-hover:scale-110 transition-transform">
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[9px] font-bold ${
                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                <span>{stat.change}</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            {typeof stat.value === 'number' ? (
              <Price amount={stat.value} className="text-3xl font-serif text-brand-dark" />
            ) : (
              <p className="text-3xl font-serif text-brand-dark">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-brand-dark/5 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-serif">Revenue Growth</h3>
              <p className="text-[10px] text-brand-dark/30 uppercase tracking-widest mt-1">Monthly_Performance_Protocol</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-brand-gold" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Current_Year</span>
            </div>
          </div>
          <div className="h-80 flex items-end justify-between space-x-4">
            {[45, 65, 55, 85, 75, 95, 80, 70, 90, 100, 85, 95].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center space-y-4 group">
                <div className="w-full relative">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className="w-full bg-brand-cream group-hover:bg-brand-gold transition-colors rounded-t-xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                  </motion.div>
                </div>
                <span className="text-[9px] font-mono text-brand-dark/20 uppercase tracking-tighter">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-brand-dark/5 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-serif">Top Categories</h3>
              <p className="text-[10px] text-brand-dark/30 uppercase tracking-widest mt-1">Sales_Distribution_Node</p>
            </div>
            <button className="p-3 bg-brand-cream/50 text-brand-dark rounded-xl hover:bg-brand-gold hover:text-white transition-all">
              <Filter size={18} />
            </button>
          </div>
          <div className="space-y-8">
            {[
              { label: 'Outerwear', value: 45, color: 'brand-gold' },
              { label: 'Footwear', value: 30, color: 'brand-dark' },
              { label: 'Accessories', value: 15, color: 'brand-cream' },
              { label: 'Knitwear', value: 10, color: 'emerald-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-widest">{item.label}</span>
                  <span className="text-[10px] font-mono text-brand-dark/40">{item.value}%</span>
                </div>
                <div className="h-2 bg-brand-cream/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    className={`h-full bg-${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
