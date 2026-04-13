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
import { Discount, Product } from '../../types';
import { auditService } from '../../services/auditService';

const DiscountManager = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [discountsRes, productsRes] = await Promise.all([
          axios.get(`/api/discounts?sellerId=${user.id}`),
          axios.get(`/api/products?sellerId=${user.id}`)
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

  const deleteDiscount = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await axios.delete(`/api/discounts/${id}`);
        setDiscounts(prev => Array.isArray(prev) ? prev.filter(d => d.id !== id) : []);

        auditService.logAction(
          { id: user?.id || 'unknown', name: user?.fullName || 'Unknown', role: user?.role || 'seller' },
          'DELETE',
          'discount',
          'Deleted discount',
          'warning',
          id
        );
      } catch (error) {
        console.error('Error deleting discount:', error);
      }
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    productId: '',
    percentage: 0,
    startDate: '',
    endDate: '',
  });

  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newDiscount.productId) return;

    try {
      const response = await axios.post('/api/discounts', {
        ...newDiscount,
        sellerId: user.id,
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      setDiscounts(prev => Array.isArray(prev) ? [...prev, response.data] : [response.data]);
      setIsModalOpen(false);
      setNewDiscount({ productId: '', percentage: 0, startDate: '', endDate: '' });

      auditService.logAction(
        { id: user.id, name: user.fullName, role: user.role as any },
        'CREATE',
        'discount',
        `Created new discount for product ${newDiscount.productId}`,
        'success',
        response.data.id
      );
    } catch (error) {
      console.error('Error adding discount:', error);
    }
  };

  const filteredDiscounts = Array.isArray(discounts) ? discounts.filter(d => {
    const product = Array.isArray(products) ? products.find(p => p.id === d.productId) : null;
    return product?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           product?.brand.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

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
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-brand-dark/5"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif">Add New Discount</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-brand-dark/40 hover:text-brand-dark">
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleAddDiscount} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Select Product</label>
                  <select 
                    required
                    value={newDiscount.productId}
                    onChange={(e) => setNewDiscount({ ...newDiscount, productId: e.target.value })}
                    className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20"
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Discount Percentage (%)</label>
                  <div className="relative">
                    <Percent size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                    <input 
                      type="number" 
                      required
                      min="1"
                      max="99"
                      value={newDiscount.percentage}
                      onChange={(e) => setNewDiscount({ ...newDiscount, percentage: parseInt(e.target.value) })}
                      className="w-full bg-brand-cream/30 border-none rounded-2xl pl-14 pr-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20"
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={newDiscount.startDate}
                      onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                      className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">End Date</label>
                    <input 
                      type="date" 
                      required
                      value={newDiscount.endDate}
                      onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                      className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-dark text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-dark/10"
                >
                  Create Discount
                </button>
              </form>
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
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Product</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Original Price</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Discount</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Sale Price</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {filteredDiscounts.map((discount) => {
                  const product = products.find(p => p.id === discount.productId);
                  if (!product) return null;
                  const salePrice = product.price * (1 - discount.percentage / 100);

                  return (
                    <tr key={discount.id} className="hover:bg-brand-cream/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-brand-dark/5">
                            <img src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-brand-dark">{product.name}</p>
                            <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Price amount={product.price} className="text-sm text-brand-dark/40 line-through" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 text-rose-500 font-bold">
                          <Percent size={14} />
                          <span className="text-sm">{discount.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Price amount={salePrice} className="text-sm font-bold text-brand-dark" />
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => toggleStatus(discount.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                            discount.isActive 
                              ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                              : 'bg-brand-cream text-brand-gold hover:bg-brand-cream/60'
                          }`}
                        >
                          {discount.isActive ? <CheckCircle2 size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                          {discount.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteDiscount(discount.id)}
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
    </div>
  );
};

export default DiscountManager;
