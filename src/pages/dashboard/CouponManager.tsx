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
  Ticket,
  Copy,
  Users,
  AlertCircle,
  Percent
} from 'lucide-react';
import { motion } from 'motion/react';
import { Coupon } from '../../types';
import { auditService } from '../../services/auditService';
import { FormModal } from '../../components/common/FormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const CouponManager = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed_amount',
    discountValue: '',
    minSpend: '0',
    maxDiscount: '',
    usageLimit: '',
    expiryDate: '',
    isActive: true
  });

  // Action Confirmation states
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const fetchCoupons = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await axios.get(`/api/coupons?sellerId=${user.id}`);
      if (Array.isArray(response.data)) {
        setCoupons(response.data);
      } else {
        console.error('Coupons response is not an array:', response.data);
        setCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      
      let isoDate = null;
      if (formData.expiryDate) {
        const d = new Date(formData.expiryDate);
        if (!isNaN(d.getTime())) isoDate = d.toISOString();
      }

      const payload = {
        sellerId: user.id,
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue) || 0,
        minSpend: parseFloat(formData.minSpend) || 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        expiryDate: isoDate,
        isActive: formData.isActive
      };

      if (editingId) {
        await axios.put(`/api/coupons/${editingId}`, payload);
      } else {
        await axios.post('/api/coupons', payload);
      }

      setIsModalOpen(false);
      setEditingId(null);
      fetchCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      const serverError = error.response?.data?.error;
      const details = error.response?.data?.details;
      alert(`Error: ${serverError || error.message}${details ? `\n\nDetails: ${details}` : ''}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType as any,
      discountValue: coupon.discountValue.toString(),
      minSpend: (coupon.minSpend || 0).toString(),
      maxDiscount: coupon.maxDiscount ? coupon.maxDiscount.toString() : '',
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await axios.put(`/api/coupons/${id}`, { isActive: newStatus });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: newStatus } : c));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deleteCoupon = async (id: string) => {
    setCouponToDelete(id);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      setIsSubmitting(true);
      await axios.delete(`/api/coupons/${couponToDelete}`);
      setConfirmDeleteOpen(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = Array.isArray(coupons) ? coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2 text-brand-dark">Coupon Manager</h1>
            <p className="text-brand-dark/60 text-sm">Create and manage high-conversion discount codes for your customers.</p>
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({
                code: '',
                discountType: 'percentage',
                discountValue: '',
                minSpend: '0',
                maxDiscount: '',
                usageLimit: '',
                expiryDate: '',
                isActive: true
              });
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-3 bg-brand-dark text-white px-8 py-3.5 rounded-full hover:bg-brand-gold transition-all shadow-xl shadow-brand-dark/10 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-xs font-bold uppercase tracking-widest leading-none">Create New Coupon</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-[2.5rem] border border-brand-dark/5 shadow-sm">
          <div className="flex-1 relative group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Search by code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-cream/10 border-transparent rounded-[1.5rem] pl-14 pr-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all font-mono"
            />
          </div>
          <button className="flex items-center space-x-3 bg-brand-cream/20 border border-brand-dark/5 px-8 rounded-[1.5rem] text-brand-dark/40 hover:text-brand-gold transition-all">
            <Filter size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Advanced Filters</span>
          </button>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-[3rem] border border-brand-dark/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/20">
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Coupon_Identity</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Benefit_Value</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Utilization</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Lifespan</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Status</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-brand-cream/5 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-4">
                        <div className="p-4 bg-brand-cream/50 rounded-2xl text-brand-gold group-hover:scale-110 transition-transform shadow-inner">
                          <Ticket size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-dark tracking-widest uppercase font-mono">{coupon.code}</p>
                          <p className="text-[9px] font-bold text-brand-dark/60 uppercase tracking-widest mt-1">Ref_ID: {coupon.id.substring(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-gold">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `$${coupon.discountValue} Off`}
                        </span>
                        <span className="text-[10px] text-brand-dark/70 font-medium">Min Spend: ${coupon.minSpend || 0}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/60">
                          <span>{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</span>
                          <span>{coupon.usageLimit ? `${Math.round(((coupon.usedCount || 0) / coupon.usageLimit) * 100)}%` : 'Active'}</span>
                        </div>
                        <div className="w-32 h-1.5 bg-brand-cream rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: coupon.usageLimit ? `${((coupon.usedCount || 0) / coupon.usageLimit) * 100}%` : '100%' }}
                            className={`h-full ${coupon.isActive ? 'bg-brand-gold' : 'bg-brand-dark/20'}`} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-brand-dark/60 uppercase tracking-widest">
                          {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No Expiry'}
                        </span>
                        <span className="text-[9px] text-brand-dark/60 uppercase mt-1">Expiry Date</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <button 
                        onClick={() => toggleStatus(coupon.id, coupon.isActive)}
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border transition-all ${
                          coupon.isActive 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-brand-cream text-brand-gold border-brand-dark/5 hover:bg-brand-gold hover:text-white'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end space-x-3 transition-all">
                        <button 
                          onClick={() => handleEdit(coupon)}
                          className="p-3 bg-brand-gold text-white hover:bg-brand-gold-dark transition-all rounded-xl shadow-md border border-brand-gold/20"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteCoupon(coupon.id)}
                          className="p-3 bg-red-500 text-white hover:bg-red-600 transition-all rounded-xl shadow-md border border-red-600/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCoupons.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-24 h-24 bg-brand-cream/30 rounded-full flex items-center justify-center text-brand-gold/30">
                          <Ticket size={48} />
                        </div>
                        <h3 className="text-xl font-serif text-brand-dark/40 italic">Zero_Coupons_Identified</h3>
                        <p className="text-brand-dark/30 text-xs uppercase tracking-widest font-mono">No_Data_Streams_Available</p>
                      </div>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-10 py-20 text-center">
                      <div className="flex justify-center flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Synchronizing_Vault_Records...</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integrated FormModal for Coupon Create/Edit */}
        <FormModal
          title={editingId ? 'Edit Performance Coupon' : 'Create New Coupon'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel={editingId ? 'Update Coupon' : 'Save Coupon'}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-brand-dark/80 font-bold ml-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. SUMMER2026"
                  className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-mono uppercase tracking-widest placeholder:text-brand-dark/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-brand-dark/80 font-bold ml-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all appearance-none cursor-pointer font-bold text-brand-dark/80"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed_amount">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-brand-dark/80 font-bold ml-1">Discount Value</label>
                  <div className="relative group">
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-brand-gold/10 rounded-lg group-focus-within:bg-brand-gold transition-colors">
                      {formData.discountType === 'percentage' ? <Percent size={14} className="text-brand-gold group-focus-within:text-white" /> : <DollarSign size={14} className="text-brand-gold group-focus-within:text-white" />}
                    </div>
                    <input
                      type="number"
                      required
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all placeholder:text-brand-dark/20 font-bold"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-brand-dark/5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-brand-dark/80 font-bold ml-1">Minimum Spend</label>
                  <input
                    type="number"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                    className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all placeholder:text-brand-dark/20 font-bold"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-brand-dark/80 font-bold ml-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all placeholder:text-brand-dark/20 font-bold"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-brand-dark/80 font-bold ml-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all font-mono"
                  />
                </div>
                <div className="flex items-center space-x-4 h-full pt-6 px-4">
                    <div 
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 shadow-inner ${formData.isActive ? 'bg-brand-gold' : 'bg-brand-dark/20'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-all transform duration-300 ${formData.isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-dark/80 font-bold">Active Status</span>
                </div>
              </div>
            </div>
          </div>
        </FormModal>

        {/* Delete Confirmation */}
        <ConfirmModal
          isOpen={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Coupon"
          message="Are you sure you want to permanently delete this coupon? This action cannot be undone."
          confirmText="Delete Now"
          variant="danger"
          isLoading={isSubmitting}
        />
    </div>
  );
};

export default CouponManager;

