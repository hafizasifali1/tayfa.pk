import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
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
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Promotion } from '../../types';
import { auditService } from '../../services/auditService';

const PromotionManager = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`/api/promotions?sellerId=${user.id}`);
        if (Array.isArray(response.data)) {
          setPromotions(response.data);
        } else {
          console.error('Promotions response is not an array:', response.data);
          setPromotions([]);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [user?.id]);

  const toggleStatus = async (id: string) => {
    if (!Array.isArray(promotions)) return;
    const promo = promotions.find(p => p.id === id);
    if (!promo) return;

    try {
      const newStatus = !promo.isActive;
      await axios.put(`/api/promotions/${id}`, { isActive: newStatus });
      
      setPromotions(prev => Array.isArray(prev) ? prev.map(p => p.id === id ? { ...p, isActive: newStatus } : p) : []);

      auditService.logAction(
        { id: user?.id || 'unknown', name: user?.fullName || 'Unknown', role: user?.role || 'seller' },
        'UPDATE',
        'promotion',
        `Toggled promotion status to ${newStatus ? 'Active' : 'Inactive'}`,
        'info',
        id
      );
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deletePromotion = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await axios.delete(`/api/promotions/${id}`);
        setPromotions(prev => Array.isArray(prev) ? prev.filter(p => p.id !== id) : []);

        auditService.logAction(
          { id: user?.id || 'unknown', name: user?.fullName || 'Unknown', role: user?.role || 'seller' },
          'DELETE',
          'promotion',
          'Deleted promotion',
          'warning',
          id
        );
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  const filteredPromotions = Array.isArray(promotions) ? promotions.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">Promotion Manager</h1>
            <p className="text-brand-dark/60">Manage your store's marketing campaigns and sales events.</p>
          </div>
          <button className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10">
            <Plus size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Create Promotion</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search promotions..." 
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
          {Array.isArray(filteredPromotions) && filteredPromotions.map((promo) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[3rem] border border-brand-dark/5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-brand-cream/50 rounded-2xl text-brand-gold group-hover:scale-110 transition-transform">
                  <Gift size={24} />
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toggleStatus(promo.id)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      promo.isActive 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'bg-brand-cream text-brand-gold hover:bg-brand-cream/60'
                    }`}
                  >
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-serif text-brand-dark">{promo.name}</h3>
                  <p className="text-xs text-brand-dark/60 mt-1">{promo.description}</p>
                </div>

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
                    <span className="text-sm font-bold text-brand-dark">{Array.isArray(promo.applicableProducts) ? promo.applicableProducts.length : 0} Products</span>
                    <ArrowRight size={14} className="text-brand-gold" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 p-8 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-3 bg-brand-cream/50 text-brand-dark rounded-full hover:bg-brand-gold hover:text-white transition-all">
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => deletePromotion(promo.id)}
                  className="p-3 bg-brand-cream/50 text-brand-dark rounded-full hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
          {(!Array.isArray(filteredPromotions) || filteredPromotions.length === 0) && (
            <div className="lg:col-span-2 px-8 py-20 text-center bg-white rounded-[3rem] border border-brand-dark/5">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center text-brand-gold">
                  <Gift size={32} />
                </div>
                <p className="text-brand-dark/40 text-sm font-medium">No promotions found.</p>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default PromotionManager;
