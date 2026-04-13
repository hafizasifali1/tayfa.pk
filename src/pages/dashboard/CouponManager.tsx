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
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Coupon } from '../../types';
import { auditService } from '../../services/auditService';

const CouponManager = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!user?.id) return;
      try {
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
    fetchCoupons();
  }, [user?.id]);

  const toggleStatus = async (id: string) => {
    if (!Array.isArray(coupons)) return;
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;

    try {
      const newStatus = !coupon.isActive;
      await axios.put(`/api/coupons/${id}`, { isActive: newStatus });
      
      setCoupons(prev => Array.isArray(prev) ? prev.map(c => c.id === id ? { ...c, isActive: newStatus } : c) : []);

      auditService.logAction(
        { id: user?.id || 'unknown', name: user?.fullName || 'Unknown', role: user?.role || 'seller' },
        'UPDATE',
        'coupon',
        `Toggled coupon status to ${newStatus ? 'Active' : 'Inactive'}`,
        'info',
        id
      );
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await axios.delete(`/api/coupons/${id}`);
        setCoupons(prev => Array.isArray(prev) ? prev.filter(c => c.id !== id) : []);

        auditService.logAction(
          { id: user?.id || 'unknown', name: user?.fullName || 'Unknown', role: user?.role || 'seller' },
          'DELETE',
          'coupon',
          'Deleted coupon',
          'warning',
          id
        );
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  const filteredCoupons = Array.isArray(coupons) ? coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">Coupon Manager</h1>
            <p className="text-brand-dark/60">Create and manage discount codes for your customers.</p>
          </div>
          <button className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10">
            <Plus size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Create Coupon</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search coupons..." 
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

        {/* Coupons Table */}
        <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/20">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Coupon Code</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Discount</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Usage</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Duration</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-brand-cream/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-brand-cream/50 rounded-xl text-brand-gold">
                          <Ticket size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-dark tracking-widest">{coupon.code}</p>
                          <p className="text-[10px] text-brand-dark/40 mt-1">{coupon.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-brand-dark">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                          <span>{coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                          <span>{Math.round((coupon.usageCount / (coupon.usageLimit || 1)) * 100)}%</span>
                        </div>
                        <div className="w-32 h-1.5 bg-brand-cream rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-gold" 
                            style={{ width: `${(coupon.usageCount / (coupon.usageLimit || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleStatus(coupon.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                          coupon.isActive 
                            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                            : 'bg-brand-cream text-brand-gold hover:bg-brand-cream/60'
                        }`}
                      >
                        {coupon.isActive ? <CheckCircle2 size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-brand-dark/40">
                        {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors">
                          <Copy size={16} />
                        </button>
                        <button className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteCoupon(coupon.id)}
                          className="p-2 text-brand-dark/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCoupons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center text-brand-gold">
                          <Ticket size={32} />
                        </div>
                        <p className="text-brand-dark/40 text-sm font-medium">No coupons found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default CouponManager;
