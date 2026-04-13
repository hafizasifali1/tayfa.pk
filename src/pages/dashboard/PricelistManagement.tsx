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
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Pricelist, Product } from '../../types';
import { auditService } from '../../services/auditService';

const PricelistManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [pricelists, setPricelists] = useState<Pricelist[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPricelist, setNewPricelist] = useState({
    name: '',
    description: '',
    currency: 'USD',
    items: [] as { productId: string; price: number }[]
  });
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [pricelistsRes, productsRes] = await Promise.all([
          axios.get(`/api/pricelists?sellerId=${user.id}`),
          axios.get(`/api/products?sellerId=${user.id}`)
        ]);
        if (Array.isArray(pricelistsRes.data)) {
          setPricelists(pricelistsRes.data);
        } else {
          console.error('Pricelists response is not an array:', pricelistsRes.data);
          setPricelists([]);
        }
        if (Array.isArray(productsRes.data)) {
          setAvailableProducts(productsRes.data);
        } else {
          console.error('Products response is not an array:', productsRes.data);
          setAvailableProducts([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleCreatePricelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const pricelistData = {
        sellerId: user.id,
        ...newPricelist,
        isActive: true
      };

      const response = await axios.post('/api/pricelists', pricelistData);
      const createdPricelist = response.data;
      
      setPricelists(prev => [...prev, createdPricelist]);
      setIsCreateModalOpen(false);
      setNewPricelist({ name: '', description: '', currency: 'USD', items: [] });

      auditService.logAction(
        { id: user.id, name: user.fullName, role: user.role as any },
        'CREATE',
        'pricelist',
        `Created new pricelist: ${createdPricelist.name}`,
        'success',
        createdPricelist.id
      );
    } catch (error) {
      console.error('Error creating pricelist:', error);
    }
  };

  const toggleStatus = async (id: string) => {
    if (!Array.isArray(pricelists)) return;
    const pricelist = pricelists.find(pl => pl.id === id);
    if (!pricelist) return;

    try {
      const newStatus = !pricelist.isActive;
      await axios.put(`/api/pricelists/${id}`, { isActive: newStatus });
      
      setPricelists(prev => Array.isArray(prev) ? prev.map(pl => pl.id === id ? { ...pl, isActive: newStatus } : pl) : []);

      auditService.logAction(
        { id: user?.id || 'unknown', name: user?.fullName || 'Unknown', role: user?.role || 'seller' },
        'UPDATE',
        'pricelist',
        `Toggled pricelist status to ${newStatus ? 'Active' : 'Inactive'}`,
        'info',
        id
      );
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deletePricelist = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this pricelist?')) {
      try {
        await axios.delete(`/api/pricelists/${id}`);
        setPricelists(prev => Array.isArray(prev) ? prev.filter(pl => pl.id !== id) : []);

        auditService.logAction(
          { id: user?.id || 'unknown', name: user?.fullName || 'Unknown', role: user?.role || 'seller' },
          'DELETE',
          'pricelist',
          'Deleted pricelist',
          'warning',
          id
        );
      } catch (error) {
        console.error('Error deleting pricelist:', error);
      }
    }
  };

  const filteredPricelists = Array.isArray(pricelists) ? pricelists.filter(pl => 
    pl.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">Pricelist Management</h1>
            <p className="text-brand-dark/60">Manage custom price sets for your products.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10"
          >
            <Plus size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Create Pricelist</span>
          </button>
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-brand-dark/5 flex justify-between items-center bg-brand-cream/20">
                  <h2 className="text-2xl font-serif">Create New Pricelist</h2>
                  <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleCreatePricelist} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Pricelist Name</label>
                      <input 
                        required
                        type="text" 
                        value={newPricelist.name}
                        onChange={e => setNewPricelist(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20"
                        placeholder="e.g. Summer Sale 2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Currency</label>
                      <select 
                        value={newPricelist.currency}
                        onChange={e => setNewPricelist(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 font-bold"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Description</label>
                    <textarea 
                      value={newPricelist.description}
                      onChange={e => setNewPricelist(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 h-24 resize-none"
                      placeholder="Describe the purpose of this pricelist..."
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Add Products</label>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {Array.isArray(availableProducts) && availableProducts.map(product => {
                        const itemIdx = Array.isArray(newPricelist.items) ? newPricelist.items.findIndex(i => i.productId === product.id) : -1;
                        const isSelected = itemIdx !== -1;
                        
                        return (
                          <div key={product.id} className="flex items-center justify-between p-4 bg-brand-cream/10 rounded-2xl border border-brand-dark/5">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                                <img src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-sm font-medium">{product.name}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              {isSelected && Array.isArray(newPricelist.items) && (
                                <div className="flex items-center bg-white rounded-xl px-3 py-1 border border-brand-dark/5">
                                  <span className="text-[10px] font-bold text-brand-gold mr-2">{newPricelist.currency}</span>
                                  <input 
                                    type="number" 
                                    value={newPricelist.items[itemIdx].price}
                                    onChange={e => {
                                      const items = Array.isArray(newPricelist.items) ? newPricelist.items : [];
                                      const newItems = [...items];
                                      if (newItems[itemIdx]) {
                                        newItems[itemIdx].price = parseFloat(e.target.value) || 0;
                                        setNewPricelist(prev => ({ ...prev, items: newItems }));
                                      }
                                    }}
                                    className="w-16 border-none p-0 text-sm font-bold focus:ring-0"
                                  />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setNewPricelist(prev => ({ ...prev, items: Array.isArray(prev.items) ? prev.items.filter(i => i.productId !== product.id) : [] }));
                                  } else {
                                    setNewPricelist(prev => ({ ...prev, items: [...(Array.isArray(prev.items) ? prev.items : []), { productId: product.id, price: product.price }] }));
                                  }
                                }}
                                className={`p-2 rounded-xl transition-all ${isSelected ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark/40 hover:text-brand-gold'}`}
                              >
                                {isSelected ? <XCircle size={18} /> : <Plus size={18} />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-brand-dark text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-dark/10"
                  >
                    Create Pricelist
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search pricelists..." 
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

        {/* Pricelists Table */}
        <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/20">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Pricelist Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Items</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Currency</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Created At</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {Array.isArray(filteredPricelists) && filteredPricelists.map((pl) => (
                  <tr key={pl.id} className="hover:bg-brand-cream/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-bold text-brand-dark">{pl.name}</p>
                        <p className="text-[10px] text-brand-dark/40 mt-1">{pl.description}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-brand-dark/60">{Array.isArray(pl.items) ? pl.items.length : 0} Products</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-brand-gold">{pl.currency}</span>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleStatus(pl.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                          pl.isActive 
                            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                            : 'bg-brand-cream text-brand-gold hover:bg-brand-cream/60'
                        }`}
                      >
                        {pl.isActive ? <CheckCircle2 size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                        {pl.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-brand-dark/40">{new Date(pl.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deletePricelist(pl.id)}
                          className="p-2 text-brand-dark/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-brand-dark/40 hover:text-brand-dark transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPricelists.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center text-brand-gold">
                          <DollarSign size={32} />
                        </div>
                        <p className="text-brand-dark/40 text-sm font-medium">No pricelists found.</p>
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

export default PricelistManagement;
