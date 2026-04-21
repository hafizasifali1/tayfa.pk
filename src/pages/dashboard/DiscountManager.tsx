import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Price from '../../components/common/Price';
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
  Percent,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Discount, Product, Category } from '../../types';
import { auditService } from '../../services/auditService';
import { X as LucideX } from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Button as UIButton } from '../../components/ui/Button';

const DiscountManager = () => {
  const brandGold = '#C5A059';
  const brandDark = '#0f0f1a';
  const brandCream = '#f5f0e8';
  const darkText = '#1a1100';

  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [discountsRes, productsRes, categoriesRes] = await Promise.all([
          axios.get(`/api/discounts?sellerId=${user.id}`),
          axios.get(`/api/products?sellerId=${user.id}`),
          axios.get('/api/categories')
        ]);
        
        if (Array.isArray(discountsRes.data)) {
          setDiscounts(discountsRes.data);
        } else {
          console.error('Discounts response is not an array:', discountsRes.data);
          setDiscounts([]);
        }

        if (Array.isArray(productsRes.data)) {
          setProducts(productsRes.data);
        } else {
          console.error('Products response is not an array:', productsRes.data);
          setProducts([]);
        }

        if (Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching discount data:', error);
        setDiscounts([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const toggleStatus = async (id: string) => {
    if (!Array.isArray(discounts)) return;
    const discount = discounts.find(d => d.id === id);
    if (!discount) return;

    try {
      const newStatus = !discount.isActive;
      await axios.put(`/api/discounts/${id}`, { isActive: newStatus });
      
      setDiscounts(prev => Array.isArray(prev) ? prev.map(d => d.id === id ? { ...d, isActive: newStatus } : d) : []);

      auditService.logAction(
        { id: user?.id || 'unknown', name: user?.fullName || 'Unknown', role: user?.role || 'seller' },
        'UPDATE',
        'discount',
        `Toggled discount status to ${newStatus ? 'Active' : 'Inactive'}`,
        'info',
        id
      );
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id || !user?.id) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`/api/discounts/${deleteModal.id}`);
      setDiscounts(prev => Array.isArray(prev) ? prev.filter(d => d.id !== deleteModal.id) : []);
      
      auditService.logAction(
        { id: user.id, name: user.fullName, role: user.role as any },
        'DELETE',
        'discount',
        `Deleted discount ID: ${deleteModal.id}`,
        'warning',
        deleteModal.id
      );
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting discount:', error);
      alert('Failed to delete discount.');
    } finally {
      setIsDeleting(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDiscount, setNewDiscount] = useState<{
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    status: 'active' | 'inactive' | 'scheduled';
    applyTo: 'all' | 'specific' | 'category';
    productIds: string[];
    categoryId: string;
    startDate: string;
    endDate: string;
  }>({
    name: '',
    type: 'percentage',
    value: 0,
    status: 'active',
    applyTo: 'all',
    productIds: [],
    categoryId: '',
    startDate: '',
    endDate: '',
  });

  const handleEditClick = (discount: Discount) => {
    setEditingId(discount.id);
    setNewDiscount({
      name: discount.name,
      type: discount.type as 'percentage' | 'fixed',
      value: discount.value,
      status: discount.status as any,
      applyTo: discount.applyTo as any,
      productIds: Array.isArray(discount.productIds) ? discount.productIds : [],
      categoryId: discount.categoryId || '',
      startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
      endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newDiscount.name || !newDiscount.startDate || !newDiscount.endDate) {
      alert('Please fill in all required fields including start and end dates.');
      return;
    }

    if (newDiscount.applyTo === 'specific' && newDiscount.productIds.length === 0) {
      alert('Please select at least one product.');
      return;
    }

    if (newDiscount.applyTo === 'category' && !newDiscount.categoryId) {
      alert('Please select a category.');
      return;
    }

    try {
      if (editingId) {
        const response = await axios.put(`/api/discounts/${editingId}`, {
          ...newDiscount,
          sellerId: user.id,
          isActive: newDiscount.status === 'active',
        });
        setDiscounts(prev => prev.map(d => d.id === editingId ? response.data : d));
        auditService.logAction(
          { id: user.id, name: user.fullName, role: user.role as any },
          'UPDATE',
          'discount',
          `Updated discount: ${newDiscount.name}`,
          'info',
          editingId
        );
      } else {
        const response = await axios.post('/api/discounts', {
          ...newDiscount,
          sellerId: user.id,
          isActive: newDiscount.status === 'active',
          createdAt: new Date().toISOString(),
        });
        setDiscounts(prev => [response.data, ...(Array.isArray(prev) ? prev : [])]);
        auditService.logAction(
          { id: user.id, name: user.fullName, role: user.role as any },
          'CREATE',
          'discount',
          `Created new discount: ${newDiscount.name}`,
          'success',
          response.data.id
        );
      }

      setIsModalOpen(false);
      setEditingId(null);
      setNewDiscount({
        name: '',
        type: 'percentage',
        value: 0,
        status: 'active',
        applyTo: 'all',
        productIds: [],
        categoryId: '',
        startDate: '',
        endDate: '',
      });
    } catch (error: any) {
      console.error('Error adding discount:', error);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to create discount. Please check all fields.';
      alert(`Error: ${errorMsg}`);
    }
  };

  const filteredDiscounts = Array.isArray(discounts) ? discounts.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">Discount Manager</h1>
            <p className="text-brand-dark/60">Apply direct discounts to your products.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10"
          >
            <Plus size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Add Discount</span>
          </button>
        </div>

        {/* Add Discount Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
              style={{ borderRadius: '12px', maxHeight: '85vh' }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-10 py-5" style={{ backgroundColor: brandGold }}>
                <h2 className="text-xl font-serif text-brand-dark">{editingId ? 'Edit Discount' : 'Add New Discount'}</h2>
                <button 
                  onClick={() => { setIsModalOpen(false); setEditingId(null); }} 
                  className="text-brand-dark hover:text-brand-dark/70 transition-colors"
                >
                  <LucideX size={24} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar overflow-x-hidden">
                <form onSubmit={handleAddDiscount} className="space-y-[1.25rem]">
                  <div>
                    <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>Discount Name/Title</label>
                    <input 
                      required
                      type="text" 
                      value={newDiscount.name}
                      onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                      className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-6 py-2.5 text-sm focus:outline-none transition-all"
                      style={{ 
                        boxShadow: 'none',
                        ['--tw-ring-color' as any]: 'transparent' 
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = brandGold;
                        e.target.style.boxShadow = `0 0 0 3px ${brandGold}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(15, 15, 26, 0.05)';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="e.g. Summer Clearance"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>Discount Type</label>
                      <select 
                        value={newDiscount.type}
                        onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value as 'percentage' | 'fixed' })}
                        className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-6 py-2.5 text-sm focus:outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = brandGold;
                          e.target.style.boxShadow = `0 0 0 3px ${brandGold}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(15, 15, 26, 0.05)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>Status</label>
                      <select 
                        value={newDiscount.status}
                        onChange={(e) => setNewDiscount({ ...newDiscount, status: e.target.value as any })}
                        className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-6 py-2.5 text-sm focus:outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = brandGold;
                          e.target.style.boxShadow = `0 0 0 3px ${brandGold}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(15, 15, 26, 0.05)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>
                      {newDiscount.type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (PKR)'}
                    </label>
                    <div className="relative">
                      {newDiscount.type === 'percentage' ? (
                        <Percent size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                      ) : (
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-dark/40">PKR</span>
                      )}
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={newDiscount.value}
                        onChange={(e) => setNewDiscount({ ...newDiscount, value: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl pl-14 pr-6 py-2.5 text-sm focus:outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = brandGold;
                          e.target.style.boxShadow = `0 0 0 3px ${brandGold}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(15, 15, 26, 0.05)';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder={newDiscount.type === 'percentage' ? "e.g. 20" : "e.g. 500"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>Apply To</label>
                    <select 
                      value={newDiscount.applyTo}
                      onChange={(e) => setNewDiscount({ ...newDiscount, applyTo: e.target.value as any, productIds: [], categoryId: '' })}
                      className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-6 py-2.5 text-sm focus:outline-none transition-all"
                      onFocus={(e) => {
                        e.target.style.borderColor = brandGold;
                        e.target.style.boxShadow = `0 0 0 3px ${brandGold}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(15, 15, 26, 0.05)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="all">All Products</option>
                      <option value="specific">Specific Products</option>
                      <option value="category">Category</option>
                    </select>
                  </div>

                  {newDiscount.applyTo === 'specific' && (
                    <div>
                      <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>Select Products (Multi-select)</label>
                      <div 
                        className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl p-4 transition-all"
                        style={{ minHeight: '3.5rem' }}
                      >
                        <div className="flex flex-wrap gap-2 mb-3">
                          {newDiscount.productIds.map(pid => {
                            const product = products.find(p => p.id === pid);
                            return (
                              <div 
                                key={pid} 
                                className="group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all"
                                style={{ 
                                  backgroundColor: brandGold, 
                                  color: darkText,
                                  borderColor: brandGold
                                }}
                              >
                                <span>{product?.name}</span>
                                <button 
                                  type="button" 
                                  onClick={() => setNewDiscount({ ...newDiscount, productIds: newDiscount.productIds.filter(id => id !== pid) })}
                                  className="hover:text-brand-dark/60 transition-colors"
                                >
                                  <LucideX size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <select 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && !newDiscount.productIds.includes(val)) {
                              setNewDiscount({ ...newDiscount, productIds: [...newDiscount.productIds, val] });
                            }
                            e.target.value = '';
                          }}
                          className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 outline-none cursor-pointer"
                        >
                          <option value="">{newDiscount.productIds.length > 0 ? "Add more products..." : "Choose products..."}</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id} disabled={newDiscount.productIds.includes(p.id)}>
                              {p.name} ({p.brand})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {newDiscount.applyTo === 'category' && (
                    <div>
                      <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>Select Category</label>
                      <select 
                        required
                        value={newDiscount.categoryId}
                        onChange={(e) => setNewDiscount({ ...newDiscount, categoryId: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-6 py-2.5 text-sm focus:outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = brandGold;
                          e.target.style.boxShadow = `0 0 0 3px ${brandGold}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(15, 15, 26, 0.05)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">Choose a category...</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>Start Date</label>
                      <input 
                        type="date" 
                        required
                        value={newDiscount.startDate}
                        onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-6 py-2.5 text-sm focus:outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = brandGold;
                          e.target.style.boxShadow = `0 0 0 3px ${brandGold}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(15, 15, 26, 0.05)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>End Date</label>
                      <input 
                        type="date" 
                        required
                        value={newDiscount.endDate}
                        onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-6 py-2.5 text-sm focus:outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = brandGold;
                          e.target.style.boxShadow = `0 0 0 3px ${brandGold}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(15, 15, 26, 0.05)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                      className="flex-1 py-3 rounded-full font-bold uppercase tracking-widest transition-all border border-brand-dark/10 hover:bg-brand-cream text-[11px]"
                      style={{ color: brandDark }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] py-3 rounded-full font-bold uppercase tracking-widest transition-all shadow-xl text-[11px]"
                      style={{ backgroundColor: brandGold, color: darkText }}
                      onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
                    >
                      {editingId ? 'Save Changes' : 'Create Discount'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search products..." 
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

        {/* Discounts Table */}
        <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/20">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Discount Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Apply To</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Value</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Dates</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {filteredDiscounts.map((discount) => {
                  return (
                    <tr key={discount.id} className="hover:bg-brand-cream/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-sm font-bold text-brand-dark">{discount.name}</p>
                          <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest">
                            {discount.type === 'percentage' ? `${discount.value}% OFF` : `Flat ${discount.value} PKR`}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-brand-gold">{discount.applyTo}</span>
                          <span className="text-[10px] text-brand-dark/60 font-medium">
                            {discount.applyTo === 'all' && 'All Marketplace'}
                            {discount.applyTo === 'specific' && `${discount.productIds?.length || 0} Products Selected`}
                            {discount.applyTo === 'category' && 'Category Selection'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-brand-dark">
                          {discount.type === 'percentage' ? `${discount.value}%` : <Price amount={discount.value} />}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col text-[10px] text-brand-dark/70">
                          <span>Start: {new Date(discount.startDate).toLocaleDateString()}</span>
                          <span>End: {new Date(discount.endDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => toggleStatus(discount.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                            discount.isActive 
                              ? 'text-white' 
                              : 'bg-brand-dark/5 text-brand-dark/40'
                          }`}
                          style={discount.isActive ? { backgroundColor: brandGold } : {}}
                        >
                          {discount.isActive ? <CheckCircle2 size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                          {discount.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleEditClick(discount)}
                            className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteModal({ isOpen: true, id: discount.id })}
                            className="p-2 text-brand-dark/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredDiscounts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center text-brand-gold">
                          <Tag size={32} />
                        </div>
                        <p className="text-brand-dark/40 text-sm font-medium">No discounts found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Discount"
          message="Are you sure you want to delete this discount? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          isLoading={isDeleting}
        />
    </div>
  );
};

export default DiscountManager;
