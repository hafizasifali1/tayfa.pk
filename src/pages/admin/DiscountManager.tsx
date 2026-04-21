import React, { useState } from 'react';
import Price from '../../components/common/Price';
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
  ArrowRight,
  Store
} from 'lucide-react';
import { motion } from 'motion/react';
import { Product, Discount, Category } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { X as LucideX } from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const AdminDiscountManager = () => {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [discountsRes, productsRes, categoriesRes] = await Promise.all([
          axios.get(`/api/discounts?t=${Date.now()}`),
          axios.get('/api/products'),
          axios.get('/api/categories')
        ]);
        setDiscounts(discountsRes.data);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching admin discount data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscount.name || !newDiscount.startDate || !newDiscount.endDate) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        const response = await axios.put(`/api/discounts/${editingId}`, {
          ...newDiscount,
          sellerId: 'admin',
          isActive: newDiscount.status === 'active',
        });
        setDiscounts(prev => prev.map(d => d.id === editingId ? response.data : d));
      } else {
        const response = await axios.post('/api/discounts', {
          ...newDiscount,
          sellerId: 'admin',
          isActive: newDiscount.status === 'active',
        });
        setDiscounts(prev => [response.data, ...prev]);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      // Reset form
      setNewDiscount({
        name: '', type: 'percentage', value: 0, status: 'active',
        applyTo: 'all', productIds: [], categoryId: '',
        startDate: '', endDate: ''
      });
    } catch (error: any) {
      console.error('Error handling global discount:', error);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to process discount.';
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`/api/discounts/${deleteModal.id}`);
      setDiscounts(prev => prev.filter(d => d.id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting discount:', error);
      alert('Failed to delete discount.');
    } finally {
      setIsDeleting(false);
    }
  };

  const headers = [
    <span className="text-brand-dark/70">Discount Name</span>,
    <span className="text-brand-dark/70">Seller</span>,
    <span className="text-brand-dark/70">Apply To</span>,
    <span className="text-brand-dark/70">Value</span>,
    <span className="text-brand-dark/70">Dates</span>,
    <span className="text-brand-dark/70">Status</span>,
    <div className="text-right text-brand-dark/70">Actions</div>
  ];

  const filteredDiscounts = Array.isArray(discounts) ? discounts.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2 text-brand-dark">Global Discounts</h1>
          <p className="text-brand-dark/60">Monitor and manage direct product discounts across all sellers.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          icon={<Plus size={18} />}
        >
          Apply Global Discount
        </Button>
      </div>

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
              <h2 className="text-xl font-serif text-brand-dark">{editingId ? 'Edit Global Discount' : 'Global Discount'}</h2>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingId(null); }} 
                className="text-brand-dark hover:text-brand-dark/70 transition-colors"
              >
                <LucideX size={24} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar overflow-x-hidden">
              <form onSubmit={handleCreateDiscount} className="space-y-[1.25rem]">
                <div>
                  <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>Discount Title</label>
                  <input 
                    required 
                    type="text" 
                    value={newDiscount.name} 
                    onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })} 
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>Type</label>
                    <select 
                      value={newDiscount.type} 
                      onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value as any })} 
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
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-widest mb-2" style={{ fontSize: '11px', letterSpacing: '0.7px', color: '#888' }}>Value</label>
                    <input 
                      required 
                      type="number" 
                      value={newDiscount.value} 
                      onChange={(e) => setNewDiscount({ ...newDiscount, value: parseFloat(e.target.value) || 0 })} 
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
                        {newDiscount.productIds.map(pid => (
                          <div 
                            key={pid} 
                            className="group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all"
                            style={{ 
                              backgroundColor: brandGold, 
                              color: darkText,
                              borderColor: brandGold
                            }}
                          >
                            <span>{products.find(p => p.id === pid)?.name}</span>
                            <button 
                              type="button" 
                              onClick={() => setNewDiscount({ ...newDiscount, productIds: newDiscount.productIds.filter(id => id !== pid) })}
                              className="hover:text-brand-dark/60 transition-colors"
                            >
                              <LucideX size={14} />
                            </button>
                          </div>
                        ))}
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
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
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
                    {editingId ? 'Save Changes' : 'Create Global Discount'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search by product or seller..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-brand-dark/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all"
            />
          </div>
          <Button 
            variant="outline"
            icon={<Filter size={18} />}
          >
            Filters
          </Button>
        </div>
      </Card>

      {/* Discounts Table */}
      <Card className="overflow-hidden border-brand-dark/5 shadow-sm">
        <Table headers={headers}>
          {filteredDiscounts.map((discount) => {
            return (
              <tr key={discount.id} className="hover:bg-brand-cream/10 transition-colors group">
                <td className="px-8 py-6">
                  <div>
                    <p className="text-sm font-bold text-brand-dark">{discount.name}</p>
                    <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest">{discount.type}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-brand-dark/60">
                      {discount.sellerId === 'admin' ? 'Admin (Global)' : (discount.sellerName || discount.sellerEmail || discount.sellerId || 'Unknown Seller')}
                    </span>
                    {discount.sellerName && discount.sellerEmail && (
                      <span className="text-[10px] text-brand-dark/30">{discount.sellerEmail}</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <Badge variant="outline">{discount.applyTo}</Badge>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-bold text-brand-dark">
                    {discount.type === 'percentage' ? `${discount.value}%` : <Price amount={discount.value} />}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col text-[10px] text-brand-dark/70">
                    <span>From: {new Date(discount.startDate).toLocaleDateString()}</span>
                    <span>To: {new Date(discount.endDate).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      discount.isActive ? 'text-white' : 'bg-brand-dark/5 text-brand-dark/40'
                    }`}
                    style={discount.isActive ? { backgroundColor: brandGold } : {}}
                  >
                    {discount.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={<Edit2 size={16} />} 
                      onClick={() => handleEditClick(discount)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={<Trash2 size={16} />} 
                      className="text-red-500 hover:text-red-600" 
                      onClick={() => setDeleteModal({ isOpen: true, id: discount.id })}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Global Discount"
        message="Are you sure you want to delete this global discount? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminDiscountManager;
