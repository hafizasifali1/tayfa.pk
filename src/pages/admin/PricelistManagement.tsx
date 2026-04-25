import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { products as allProductsData } from '../../data/products';
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
  Store,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Pricelist } from '../../types';
import { auditService } from '../../services/auditService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { fetchCountries } from '../../services/currencyService';
import { Country } from '../../types';

const AdminPricelistManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [pricelists, setPricelists] = useState<(Pricelist & { sellerName: string })[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<{code: string; symbol: string}[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    const fetchPricelists = async () => {
      try {
        const response = await axios.get('/api/pricelists');
        if (Array.isArray(response.data)) {
          // Enriched with seller names (Global if isGlobal is true)
          const enriched = response.data.map((pl: any) => ({
            ...pl,
            sellerName: pl.isGlobal ? 'Global' : (pl.sellerId === 'admin' ? 'Global' : `Seller ${pl.sellerId?.slice(0, 4) || 'Unknown'}`)
          }));
          setPricelists(enriched);
        }
      } catch (err) {
        console.error('Error fetching pricelists:', err);
      }
    };
    fetchPricelists();
  }, []);

  useEffect(() => {
    const loadCurrencies = async () => {
      const countries = await fetchCountries();
      const activeCountries = countries.filter(c => c.isActive);
      
      // Get unique currencies
      const uniqueCurrencies = activeCountries.reduce((acc, current) => {
        if (!acc.find(item => item.code === current.currencyCode)) {
          acc.push({ code: current.currencyCode, symbol: current.symbol });
        }
        return acc;
      }, [] as {code: string; symbol: string}[]);
      
      setAvailableCurrencies(uniqueCurrencies);
      if (uniqueCurrencies.length > 0) {
        setNewPricelist(prev => ({ ...prev, currency: uniqueCurrencies[0].code }));
      }
    };
    loadCurrencies();
  }, []);

  const toggleStatus = async (id: string) => {
    if (!Array.isArray(pricelists)) return;
    const pl = pricelists.find(p => p.id === id);
    if (!pl) return;

    try {
      const newStatus = !pl.isActive;
      await axios.put(`/api/pricelists/${id}`, { isActive: newStatus });
      
      setPricelists(prev => prev.map(p => p.id === id ? { ...p, isActive: newStatus } : p));

      auditService.logAction(
        { id: user?.id || 'admin', name: user?.fullName || 'Admin', role: 'admin' },
        'UPDATE',
        'pricelist',
        `Admin toggled pricelist status to ${newStatus ? 'Active' : 'Inactive'}`,
        'info',
        id
      );
    } catch (err) {
      console.error('Error toggling pricelist status:', err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    
    try {
      const id = deleteModal.id;
      await axios.delete(`/api/pricelists/${id}`);
      
      setPricelists(prev => prev.filter(pl => pl.id !== id));

      auditService.logAction(
        { id: user?.id || 'admin', name: user?.fullName || 'Admin', role: 'admin' },
        'DELETE',
        'pricelist',
        'Admin deleted pricelist',
        'warning',
        id
      );
    } catch (err) {
      console.error('Error deleting pricelist:', err);
    }
    setDeleteModal({ isOpen: false, id: null });
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPricelist, setNewPricelist] = useState({
    name: '',
    description: '',
    currency: 'USD',
    items: [] as { productId: string; price: number }[]
  });

  const handleEdit = (pl: any) => {
    try {
      setEditingId(pl.id);
      setNewPricelist({
        name: pl.name || '',
        description: pl.description || '',
        currency: pl.currency || availableCurrencies[0]?.code || 'USD',
        items: Array.isArray(pl.items) ? [...pl.items] : []
      });
      setIsCreateModalOpen(true);
    } catch (err) {
      console.error('Error in handleEdit:', err);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setNewPricelist({ 
      name: '', 
      description: '', 
      currency: availableCurrencies[0]?.code || 'USD', 
      items: [] 
    });
    setIsCreateModalOpen(true);
  };

  const handleSavePricelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        // Update existing
        await axios.put(`/api/pricelists/${editingId}`, {
          ...newPricelist,
          isGlobal: true // This page is specifically for global pricelists
        });
        
        setPricelists(prev => prev.map(pl => 
          pl.id === editingId ? { ...pl, ...newPricelist, isGlobal: true } : pl
        ));

        auditService.logAction(
          { id: user.id, name: user.fullName, role: 'admin' },
          'UPDATE',
          'pricelist',
          `Admin updated global pricelist: ${newPricelist.name}`,
          'success',
          editingId
        );
      } else {
        // Create new
        const response = await axios.post('/api/pricelists', {
          ...newPricelist,
          isGlobal: true,
          sellerId: null, // Global pricelists have no specific seller
          isActive: true
        });

        const pricelist = response.data;
        setPricelists(prev => [...prev, { ...pricelist, sellerName: 'Global' }]);

        auditService.logAction(
          { id: user.id, name: user.fullName, role: 'admin' },
          'CREATE',
          'pricelist',
          `Admin created global pricelist: ${pricelist.name}`,
          'success',
          pricelist.id
        );
      }
      setIsCreateModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving pricelist:', err);
    }
  };

  const filteredPricelists = Array.isArray(pricelists) ? pricelists.filter(pl => 
    pl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pl.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const headers = [
    'Pricelist & Seller',
    'Items',
    'Currency',
    'Status',
    'Created At',
    <div className="text-right">Actions</div>
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2 text-brand-dark">Global Pricelists</h1>
          <p className="text-brand-dark/60">Oversee and manage pricelists across all sellers.</p>
        </div>
        <Button 
          onClick={handleAddNew}
          icon={<Plus size={18} />}
        >
          Create Global Pricelist
        </Button>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingId(null);
        }}
        title={editingId ? 'Edit Pricelist' : 'Create Global Pricelist'}
        size="lg"
      >
        <form onSubmit={handleSavePricelist} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Pricelist Name</label>
              <input 
                required
                type="text" 
                value={newPricelist.name || ''}
                onChange={e => setNewPricelist(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20"
                placeholder="e.g. Global Summer Discounts"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Currency</label>
              <select 
                value={newPricelist.currency || ''}
                onChange={e => setNewPricelist(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 font-bold"
              >
                {availableCurrencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Description</label>
            <textarea 
              value={newPricelist.description || ''}
              onChange={e => setNewPricelist(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand-gold/20 h-24 resize-none"
              placeholder="Describe the purpose of this global pricelist..."
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Add Products (Global)</label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {Array.isArray(allProductsData) && allProductsData.map(product => {
                const itemIdx = newPricelist.items.findIndex(i => i.productId === product.id);
                const isSelected = itemIdx !== -1;
                
                return (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-brand-cream/10 rounded-2xl border border-brand-dark/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      {isSelected && (
                        <div className="flex items-center bg-white rounded-xl px-3 py-1 border border-brand-dark/5">
                          <span className="text-[10px] font-bold text-brand-gold mr-2">{newPricelist.currency}</span>
                          <input 
                            type="number" 
                            value={newPricelist.items[itemIdx].price}
                            onChange={e => {
                              const newItems = [...newPricelist.items];
                              newItems[itemIdx].price = parseFloat(e.target.value) || 0;
                              setNewPricelist(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-16 border-none p-0 text-sm font-bold focus:ring-0"
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewPricelist(prev => ({ ...prev, items: prev.items.filter(i => i.productId !== product.id) }));
                          } else {
                            setNewPricelist(prev => ({ ...prev, items: [...prev.items, { productId: product.id, price: product.price }] }));
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

          <Button 
            type="submit"
            fullWidth
          >
            {editingId ? 'Update Pricelist' : 'Create Global Pricelist'}
          </Button>
        </form>
      </Modal>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search by pricelist or seller..." 
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

      {/* Pricelists Table */}
      <Card className="overflow-hidden border-brand-dark/5 shadow-sm">
        <Table headers={headers}>
          {filteredPricelists.map((pl) => (
            <tr key={pl.id} className="hover:bg-brand-cream/10 transition-colors group">
              <td className="px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-brand-cream/50 rounded-lg text-brand-gold">
                    <Store size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-dark">{pl.name}</p>
                    <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">{pl.sellerName}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="text-xs font-medium text-brand-dark/60">{Array.isArray(pl.items) ? pl.items.length : 0} Products</span>
              </td>
              <td className="px-8 py-6">
                <span className="text-xs font-bold text-brand-gold">{pl.currency}</span>
              </td>
              <td className="px-8 py-6">
                <Badge 
                  variant={pl.isActive ? 'success' : 'warning'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleStatus(pl.id)}
                >
                  {pl.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-8 py-6">
                <span className="text-xs text-brand-dark/40">{new Date(pl.createdAt).toLocaleDateString()}</span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end space-x-2 transition-opacity">
                  <button 
                    onClick={() => handleEdit(pl)}
                    className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors"
                    title="Edit Pricelist"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(pl.id)}
                    className="p-2 text-brand-dark/40 hover:text-red-500 transition-colors"
                    title="Delete Pricelist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Global Pricelist"
        message="Are you sure you want to delete this global pricelist? This will remove all custom pricing rules associated with it across the platform."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminPricelistManagement;
