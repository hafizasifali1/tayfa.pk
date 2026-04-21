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
  Store,
  X,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Promotion } from '../../types';
import { auditService } from '../../services/auditService';

interface AdminPromotion extends Promotion {
  sellerName?: string;
}

const AdminPromotionManager = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed_amount' | 'buy_x_get_y',
    value: '',
    minPurchase: '0',
    startDate: '',
    endDate: '',
    isActive: true
  });

  const fetchAllPromotions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/promotions');
      if (Array.isArray(response.data)) {
        setPromotions(response.data);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPromotions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const payload = {
        ...formData,
        sellerId: 'admin', // Admin created promotions are global
        value: parseFloat(formData.value) || 0,
        minPurchase: parseFloat(formData.minPurchase) || 0,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingId) {
        await axios.put(`/api/promotions/${editingId}`, payload);
        auditService.logAction(
          { id: user.id, name: user.fullName || 'Admin', role: 'admin' },
          'UPDATE',
          'promotion',
          `Admin updated promotion: ${formData.name}`,
          'info',
          editingId
        );
      } else {
        await axios.post('/api/promotions', payload);
        auditService.logAction(
          { id: user.id, name: user.fullName || 'Admin', role: 'admin' },
          'CREATE',
          'promotion',
          `Admin created global promotion: ${formData.name}`,
          'success'
        );
      }

      setIsModalOpen(false);
      setEditingId(null);
      fetchAllPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleEdit = (promo: AdminPromotion) => {
    setEditingId(promo.id);
    setFormData({
      name: promo.name,
      description: promo.description,
      type: promo.type,
      value: promo.value.toString(),
      minPurchase: promo.minPurchase.toString(),
      startDate: new Date(promo.startDate).toISOString().split('T')[0],
      endDate: new Date(promo.endDate).toISOString().split('T')[0],
      isActive: promo.isActive
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put(`/api/promotions/${id}`, { isActive: !currentStatus });
      fetchAllPromotions();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deletePromotion = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/promotions/${id}`);
        fetchAllPromotions();
        auditService.logAction(
          { id: user?.id || 'admin', name: user?.fullName || 'Admin', role: 'admin' },
          'DELETE',
          'promotion',
          'Admin deleted promotion',
          'warning',
          id
        );
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  const filteredPromotions = Array.isArray(promotions) ? promotions.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sellerName && p.sellerName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2 text-brand-dark">Global Promotions</h1>
          <p className="text-brand-dark/60">Manage and monitor promotions across the entire platform.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: '',
              description: '',
              type: 'percentage',
              value: '',
              minPurchase: '0',
              startDate: '',
              endDate: '',
              isActive: true
            });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-brand-dark text-white px-8 py-3.5 rounded-full hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-xs font-bold uppercase tracking-widest">Create Global Promotion</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-dark/40" />
          <input 
            type="text" 
            placeholder="Search by promotion name or seller..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-brand-dark/5 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center space-x-2 bg-white border border-brand-dark/5 px-8 py-4 rounded-[1.5rem] text-brand-dark/60 hover:text-brand-dark transition-all shadow-sm border-brand-dark/5 hover:border-brand-gold/20">
          <Filter size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
        </button>
      </div>

      {/* Promotions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] border border-brand-dark/5" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPromotions.map((promo) => (
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
                    <h3 className="text-2xl font-serif text-brand-dark group-hover:text-brand-gold transition-colors">{promo.name}</h3>
                    <div className="flex items-center space-x-2 text-brand-gold font-bold uppercase tracking-widest text-[10px] mt-1">
                      <Store size={12} />
                      <span>{promo.sellerId === 'admin' ? 'System (Admin)' : promo.sellerName || promo.sellerId || 'Unknown Seller'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toggleStatus(promo.id, promo.isActive)}
                    className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      promo.isActive 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'bg-brand-cream text-brand-gold hover:bg-brand-gold hover:text-white'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${promo.isActive ? 'bg-green-500' : 'bg-brand-gold group-hover:bg-white'}`} />
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-brand-dark/60 line-clamp-2">{promo.description}</p>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-brand-dark/5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-1">Benefit</p>
                    <div className="flex items-center space-x-2 text-brand-dark">
                      <Tag size={14} className="text-brand-gold" />
                      <span className="text-sm font-bold uppercase">
                        {promo.type === 'percentage' ? `${promo.value}% Off` : promo.type === 'fixed_amount' ? `$${promo.value} Off` : 'BOGO'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-1">Duration</p>
                    <div className="flex items-center space-x-2 text-brand-dark/60">
                      <Calendar size={14} className="text-brand-gold" />
                      <span className="text-[10px] font-bold">
                        {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-1">Min. Purchase</p>
                    <p className="text-sm font-bold text-brand-dark">${promo.minPurchase || 0}</p>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => handleEdit(promo)}
                      className="p-3 bg-brand-cream/50 text-brand-dark rounded-xl hover:bg-brand-gold hover:text-white transition-all shadow-sm"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deletePromotion(promo.id)}
                      className="p-3 bg-brand-cream/50 text-brand-dark rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Promotion Modal (Shared Logic with Seller Dashboard) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-brand-dark/5 flex justify-between items-center bg-brand-cream/10">
                <div>
                  <h2 className="text-2xl font-serif text-brand-dark">
                    {editingId ? 'Edit Promotion' : 'Create Global Promotion'}
                  </h2>
                  <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold mt-1">Campaign Management</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-white rounded-full text-brand-dark/20 hover:text-brand-dark transition-all shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Campaign Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all text-sm"
                      placeholder="e.g. Platform Anniversary Sale"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-5 py-3.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all text-sm h-24 resize-none"
                      placeholder="Describe the global promotion..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Promotion Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-5 py-3.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all text-sm"
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed_amount">Fixed Amount Off</option>
                      <option value="buy_x_get_y">Buy X Get Y (BOGO)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Value</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        className="w-full px-5 py-3.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all text-sm pr-12"
                        placeholder="0.00"
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-dark/20 font-bold text-xs">
                        {formData.type === 'percentage' ? '%' : '$'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Min. Purchase Amount</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-dark/20" />
                      <input
                        type="number"
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                        className="w-full pl-12 pr-5 py-3.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex items-end pb-2">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-brand-gold' : 'bg-brand-dark/10'}`} />
                        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : ''}`} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/60 group-hover:text-brand-dark transition-colors">Active Status</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Start Date</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-dark/20" />
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full pl-12 pr-5 py-3.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2">End Date</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-dark/20" />
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full pl-12 pr-5 py-3.5 bg-brand-cream/10 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-brand-cream/50 text-brand-dark rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-brand-cream transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-brand-dark text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10"
                  >
                    {editingId ? 'Save Changes' : 'Create Global Promotion'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPromotionManager;
