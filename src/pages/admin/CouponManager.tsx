import React, { useState, useEffect } from 'react';
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
  Store,
  Percent,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import { Coupon } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { FormModal } from '../../components/common/FormModal';
import { auditService } from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const AdminCouponManager = () => {
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
    isActive: true,
    sellerId: '' // Admin can specify a seller or leave empty for global
  });

  // Action Confirmation states
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/coupons');
      if (Array.isArray(response.data)) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error('Error fetching admin coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      let isoDate = null;
      if (formData.expiryDate) {
        const d = new Date(formData.expiryDate);
        if (!isNaN(d.getTime())) isoDate = d.toISOString();
      }

      const payload = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue) || 0,
        minSpend: parseFloat(formData.minSpend) || 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        expiryDate: isoDate,
        isActive: formData.isActive,
        sellerId: formData.sellerId || null
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
      console.error('Error saving admin coupon:', error);
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
      isActive: coupon.isActive,
      sellerId: coupon.sellerId || ''
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put(`/api/coupons/${id}`, { isActive: !currentStatus });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
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

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headers = [
    'Coupon',
    'Discount',
    'Usage',
    'Expiry',
    'Status',
    <div className="text-right">Actions</div>
  ];

  return (
    <div className="max-w-[1440px] mx-auto space-y-10 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-2 text-brand-dark tracking-tight">Global Coupons</h1>
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
              isActive: true,
              sellerId: ''
            });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-3 bg-brand-dark text-white px-10 py-4 rounded-full hover:bg-brand-gold transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Deploy Global Coupon</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-brand-dark/5 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search coupon code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-cream/10 border-transparent rounded-2xl pl-16 pr-6 py-5 text-sm focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all font-mono tracking-widest"
          />
        </div>
        <button className="px-10 bg-brand-cream/20 text-brand-dark/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-brand-gold transition-all border border-brand-dark/5">
          Advanced Filters
        </button>
      </div>

      {/* Coupons Table */}
      <Card className="overflow-hidden border-brand-dark/5 shadow-2xl rounded-[3rem]">
        <Table headers={headers}>
          {filteredCoupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-brand-cream/5 transition-colors group">
              <td className="px-6 py-8">
                <div className="flex items-center space-x-5">
                  <div className="p-5 bg-brand-cream/50 rounded-[2rem] text-brand-gold group-hover:scale-110 transition-transform shadow-inner">
                    <Ticket size={28} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-brand-dark tracking-[0.1em] font-mono uppercase">{coupon.code}</p>
                    <div className="flex items-center space-x-2 text-brand-dark/60 font-bold uppercase tracking-widest text-[9px] mt-1.5">
                      <Store size={12} />
                      <span>{coupon.sellerId ? `Seller_ID: ${coupon.sellerId.substring(0,8)}` : 'GLOBAL_AUTHORITY'}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-8">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-brand-gold font-serif italic">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `$${coupon.discountValue} Off`}
                  </span>
                  <span className="text-[10px] text-brand-dark/70 font-bold tracking-widest uppercase mt-1">Min_Spend: ${coupon.minSpend}</span>
                </div>
              </td>
              <td className="px-6 py-8">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.3em] text-brand-dark/60">
                    <span>{coupon.usedCount || 0} / {coupon.usageLimit || 'UNLIMITED'}</span>
                  </div>
                  <div className="w-40 h-2 bg-brand-cream/50 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: coupon.usageLimit ? `${((coupon.usedCount || 0) / coupon.usageLimit) * 100}%` : '100%' }}
                      className={`h-full ${coupon.isActive ? 'bg-brand-gold shadow-[0_0_10px_rgba(var(--color-brand-gold-rgb),0.5)]' : 'bg-brand-dark/20'}`} 
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-brand-dark/60 uppercase tracking-[0.2em] font-mono">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'PERMANENT'}
                  </span>
                  <p className="text-[8px] text-brand-dark/50 uppercase font-black tracking-tighter mt-1">EXPIRE_PROTOCOL</p>
                </div>
              </td>
              <td className="px-6 py-8">
                <button 
                  onClick={() => toggleStatus(coupon.id, coupon.isActive)}
                  className={`inline-flex items-center px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-sm ${
                    coupon.isActive 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
                      : 'bg-brand-cream text-brand-gold border border-brand-dark/5 hover:invert transition-all'
                  }`}
                >
                  {coupon.isActive ? 'SYSTEM_ACTIVE' : 'LOCKED_VAULT'}
                </button>
              </td>
              <td className="px-6 py-8 text-right">
                <div className="flex items-center justify-end space-x-4 transition-all">
                  <button onClick={() => handleEdit(coupon)} className="p-4 bg-brand-gold text-white hover:bg-brand-gold-dark rounded-2xl transition-all shadow-md border border-brand-gold/20">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteCoupon(coupon.id)} className="p-4 bg-red-500 text-white hover:bg-red-600 rounded-2xl transition-all shadow-md border border-red-600/20">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredCoupons.length === 0 && !loading && (
            <tr>
              <td colSpan={6} className="px-10 py-40 text-center">
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-32 h-32 bg-brand-cream/20 rounded-full flex items-center justify-center text-brand-gold/20 shadow-inner">
                    <Ticket size={64} className="animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-serif text-brand-dark/30 italic tracking-tight">No Coupon Records Found</h3>
                </div>
              </td>
            </tr>
          )}
        </Table>
      </Card>

      <FormModal
        title={editingId ? 'Edit Coupon configuration' : 'Create Global Voucher'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitLabel={editingId ? 'Save Changes' : 'Register Coupon'}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-brand-dark/80 font-black ml-2 font-mono">Coupon Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. ALPHA_VOUCHER_10"
                className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-[2rem] px-8 py-5 text-sm focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all font-mono uppercase tracking-[0.2em] placeholder:text-brand-dark/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-brand-dark/80 font-black ml-2 font-mono">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-[2rem] px-8 py-5 text-sm focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all appearance-none cursor-pointer font-bold tracking-widest text-brand-dark/60"
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed_amount">Fixed Amount ($)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-brand-dark/80 font-black ml-2 font-mono">Discount Value</label>
                <div className="relative group">
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 p-2.5 bg-brand-gold/5 rounded-xl group-focus-within:bg-brand-gold transition-all duration-500">
                    {formData.discountType === 'percentage' ? <Percent size={16} className="text-brand-gold group-focus-within:text-white" /> : <DollarSign size={16} className="text-brand-gold group-focus-within:text-white" />}
                  </div>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-[2rem] px-8 py-5 text-sm focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all font-black text-brand-dark/80"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-brand-dark/5">
                 <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-brand-dark/80 font-black ml-2 font-mono">Seller Affiliation (Optional)</label>
                <input
                  type="text"
                  value={formData.sellerId}
                  onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                  placeholder="Paste Seller UUID or Leave Blank for Global"
                  className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-[2rem] px-8 py-5 text-[10px] font-mono focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all placeholder:text-brand-dark/10"
                />
              </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-brand-dark/80 font-black ml-2 font-mono">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-[2rem] px-8 py-5 text-sm focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all font-bold text-brand-dark/60"
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-brand-dark/80 font-black ml-2 font-mono">Minimum Purchase</label>
                <input
                  type="number"
                  value={formData.minSpend}
                  onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                  className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-[2rem] px-8 py-5 text-sm focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all font-bold text-brand-dark/60"
                  placeholder="$ 0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-brand-dark/80 font-black ml-2 font-mono">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-[2rem] px-8 py-5 text-sm focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all font-mono tracking-widest text-brand-dark/60"
                />
              </div>
              <div className="flex items-center space-x-6 pb-4 px-6">
                  <div 
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-16 h-8 rounded-full p-1.5 cursor-pointer transition-all duration-500 shadow-inner ${formData.isActive ? 'bg-brand-gold shadow-[0_0_15px_rgba(var(--color-brand-gold-rgb),0.3)]' : 'bg-brand-dark/20'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-2xl transition-all transform duration-500 ${formData.isActive ? 'translate-x-8' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-gold">Active Status</span>
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
        title="Remove Global Voucher"
        message="This will permanently delete this coupon record from the master inventory. This action is irreversible."
        confirmText="Remove Record"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default AdminCouponManager;
