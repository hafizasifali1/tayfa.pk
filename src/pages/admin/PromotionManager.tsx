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
  X as LucideX,
  AlertCircle,
  Package,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Promotion, Product, Category } from '../../types';
import { auditService } from '../../services/auditService';
import { FormModal } from '../../components/common/FormModal';

interface AdminPromotion extends Promotion {
  sellerName?: string;
}

const AdminPromotionManager = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed_amount',
    value: '',
    minPurchase: '0',
    startDate: '',
    endDate: '',
    isActive: true
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [promoRes, prodRes, catRes] = await Promise.all([
        axios.get('/api/promotions'),
        axios.get('/api/products'),
        axios.get('/api/categories-full')
      ]);
      
      if (Array.isArray(promoRes.data)) setPromotions(promoRes.data);
      if (Array.isArray(prodRes.data)) setProducts(prodRes.data);
      if (Array.isArray(catRes.data)) setCategories(catRes.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      const payload = {
        sellerId: 'admin',
        name: formData.name,
        description: formData.description,
        type: formData.type,
        value: parseFloat(formData.value) || 0,
        minPurchase: parseFloat(formData.minPurchase) || 0,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: formData.isActive
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
      fetchInitialData();
    } catch (error) {
      console.error('Error saving promotion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (promo: AdminPromotion) => {
    setEditingId(promo.id);
    setFormData({
      name: promo.name,
      description: promo.description || '',
      type: promo.type as any,
      value: promo.value.toString(),
      minPurchase: (promo.minPurchase || 0).toString(),
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
      isActive: promo.isActive
    });
    setIsModalOpen(true);
  };

  const deletePromotion = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await axios.delete(`/api/promotions/${id}`);
        fetchInitialData();
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
                <div className="flex items-center space-x-2 text-[10px]">
                   <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-widest ${
                     promo.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                   }`}>
                     {promo.isActive ? 'Active' : 'Inactive'}
                   </span>
                   {new Date(promo.startDate) > new Date() && (
                      <span className="px-3 py-1 rounded-full font-bold uppercase tracking-widest bg-blue-50 text-blue-600">
                        Scheduled
                      </span>
                    )}
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
                        {promo.type === 'percentage' ? `${promo.value}% Off` : `$${promo.value} Off`}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-1">Target</p>
                    <div className="flex items-center space-x-2 text-brand-dark/60">
                      <Package size={14} className="text-brand-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Store-wide
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold mb-1">Duration</p>
                    <p className="text-[10px] font-bold text-brand-dark">
                      {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                    </p>
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

      {/* Integrated FormModal */}
      <FormModal
        title={editingId ? 'Edit Promotion' : 'Add New Promotion'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitLabel={editingId ? 'Save Changes' : 'Create Promotion'}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Campaign Details</h4>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-brand-dark/60 font-bold">Campaign Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Platform Anniversary Sale"
              className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-brand-dark/60 font-bold">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 resize-none bg-white border border-brand-dark/10 rounded-xl p-4 focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all text-sm"
              placeholder="Describe the promotion..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/60 font-bold">Promotion Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all appearance-none"
              >
                <option value="percentage">Percentage Discount</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/60 font-bold">Value</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3.5 pr-12 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/40 text-xs font-bold">
                  {formData.type === 'percentage' ? '%' : '$'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/60 font-bold">Min. Purchase Amount</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40 text-xs font-bold">$</div>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  className="w-full bg-white border border-brand-dark/10 rounded-xl pl-8 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pb-3">
              <div 
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${formData.isActive ? 'bg-brand-gold' : 'bg-brand-dark/20'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-brand-dark/60 font-bold">Active Status</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/60 font-bold">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-brand-dark/60 font-bold">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default AdminPromotionManager;
