import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Tag,
  Calendar,
  DollarSign,
  Gift,
  ArrowRight,
  Store
} from 'lucide-react';
import { motion } from 'motion/react';
import { Promotion } from '../../types';

const AdminPromotionManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for promotions (Global/Admin view)
  const [promotions, setPromotions] = useState<(Promotion & { sellerName: string })[]>([
    {
      id: 'promo-1',
      sellerId: 'seller-1',
      sellerName: 'Luxe Boutique',
      name: 'Black Friday Blowout',
      description: 'Massive discounts on all items',
      type: 'percentage',
      value: 30,
      startDate: '2024-11-20T00:00:00Z',
      endDate: '2024-11-30T23:59:59Z',
      applicableProducts: ['1', '2', '3'],
      isActive: true
    },
    {
      id: 'promo-2',
      sellerId: 'seller-2',
      sellerName: 'Elite Fashion',
      name: 'Buy 1 Get 1 Free',
      description: 'Special offer for new arrivals',
      type: 'buy_x_get_y',
      value: 1,
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2024-06-15T23:59:59Z',
      applicableProducts: ['4'],
      isActive: false
    }
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2 text-brand-dark">Global Promotions</h1>
          <p className="text-brand-dark/60">Manage and monitor promotions across the entire platform.</p>
        </div>
        <button className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10">
          <Plus size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Create Global Promotion</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
          <input 
            type="text" 
            placeholder="Search by promotion or seller..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-brand-dark/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
          />
        </div>
        <button className="flex items-center space-x-2 bg-white border border-brand-dark/5 px-6 py-4 rounded-2xl text-brand-dark/60 hover:text-brand-dark transition-all">
          <Filter size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
        </button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.isArray(promotions) && promotions.map((promo) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[3rem] border border-brand-dark/5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-brand-cream/50 rounded-2xl text-brand-gold group-hover:scale-110 transition-transform">
                  <Gift size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-brand-dark">{promo.name}</h3>
                  <div className="flex items-center space-x-2 text-brand-gold font-bold uppercase tracking-widest text-[10px]">
                    <Store size={12} />
                    <span>{promo.sellerName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  promo.isActive 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-brand-cream text-brand-gold'
                }`}>
                  {promo.isActive ? 'Active' : 'Inactive'}
                </span>
                <button className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-brand-dark/60">{promo.description}</p>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-brand-dark/5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-1">Type & Value</p>
                  <div className="flex items-center space-x-2">
                    <Tag size={14} className="text-brand-gold" />
                    <span className="text-sm font-bold text-brand-dark">
                      {promo.type === 'percentage' ? `${promo.value}% Off` : promo.type === 'fixed_amount' ? `$${promo.value} Off` : 'BOGO'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-1">Duration</p>
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} className="text-brand-gold" />
                    <span className="text-[10px] font-bold text-brand-dark/60">
                      {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-2">Applicable Products</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-brand-dark">{promo.applicableProducts.length} Products</span>
                  <ArrowRight size={14} className="text-brand-gold" />
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 p-8 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-3 bg-brand-cream/50 text-brand-dark rounded-full hover:bg-brand-gold hover:text-white transition-all">
                <Edit2 size={18} />
              </button>
              <button className="p-3 bg-brand-cream/50 text-brand-dark rounded-full hover:bg-rose-500 hover:text-white transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminPromotionManager;
