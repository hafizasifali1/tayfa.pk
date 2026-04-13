import React, { useState, useEffect } from 'react';
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

const AdminPricelistManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [pricelists, setPricelists] = useState<(Pricelist & { sellerName: string })[]>([]);

  useEffect(() => {
    const rawData = localStorage.getItem('tayfa_pricelists');
    let savedPricelists = [];
    try {
      savedPricelists = JSON.parse(rawData || '[]');
      if (!Array.isArray(savedPricelists)) {
        savedPricelists = [];
      }
    } catch (e) {
      console.error('Error parsing pricelists from localStorage:', e);
      savedPricelists = [];
    }
    
    // In a real app, we'd fetch seller names. Here we'll mock them.
    const enriched = savedPricelists.map((pl: any) => ({
      ...pl,
      sellerName: pl.sellerId === 'admin' ? 'Global' : `Seller ${pl.sellerId.slice(0, 4)}`
    }));
    setPricelists(enriched);
  }, []);

  const toggleStatus = (id: string) => {
    if (!Array.isArray(pricelists)) return;
    const updated = pricelists.map(pl => {
      if (pl.id === id) {
        const newStatus = !pl.isActive;
        auditService.logAction(
          { id: user?.id || 'admin', name: user?.fullName || 'Admin', role: 'admin' },
          'UPDATE',
          'pricelist',
          `Admin toggled pricelist status to ${newStatus ? 'Active' : 'Inactive'}`,
          'info',
          id
        );
        return { ...pl, isActive: newStatus };
      }
      return pl;
    });
    
    setPricelists(updated);
    const rawAll = localStorage.getItem('tayfa_pricelists');
    let allPricelists = [];
    try {
      allPricelists = JSON.parse(rawAll || '[]');
      if (!Array.isArray(allPricelists)) allPricelists = [];
    } catch (e) {
      allPricelists = [];
    }
    const finalAll = allPricelists.map((pl: Pricelist) => {
      const found = updated.find(u => u.id === pl.id);
      return found ? { ...pl, isActive: found.isActive } : pl;
    });
    localStorage.setItem('tayfa_pricelists', JSON.stringify(finalAll));
  };

  const deletePricelist = (id: string) => {
    if (!Array.isArray(pricelists)) return;
    // if (window.confirm('Are you sure you want to delete this pricelist?')) {
      const updated = pricelists.filter(pl => pl.id !== id);
      setPricelists(updated);
      
      const rawAll = localStorage.getItem('tayfa_pricelists');
      let allPricelists = [];
      try {
        allPricelists = JSON.parse(rawAll || '[]');
        if (!Array.isArray(allPricelists)) allPricelists = [];
      } catch (e) {
        allPricelists = [];
      }
      const finalAll = allPricelists.filter((pl: Pricelist) => pl.id !== id);
      localStorage.setItem('tayfa_pricelists', JSON.stringify(finalAll));

      auditService.logAction(
        { id: user?.id || 'admin', name: user?.fullName || 'Admin', role: 'admin' },
        'DELETE',
        'pricelist',
        'Admin deleted pricelist',
        'warning',
        id
      );
    // }
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPricelist, setNewPricelist] = useState({
    name: '',
    description: '',
    currency: 'USD',
    items: [] as { productId: string; price: number }[]
  });

  const handleCreatePricelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const pricelist: Pricelist = {
      id: Math.random().toString(36).substr(2, 9),
      sellerId: 'admin', // Global pricelist
      ...newPricelist,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const rawAll = localStorage.getItem('tayfa_pricelists');
    let allPricelists = [];
    try {
      allPricelists = JSON.parse(rawAll || '[]');
      if (!Array.isArray(allPricelists)) allPricelists = [];
    } catch (e) {
      allPricelists = [];
    }
    const updatedAll = [...allPricelists, pricelist];
    localStorage.setItem('tayfa_pricelists', JSON.stringify(updatedAll));
    
    setPricelists(prev => Array.isArray(prev) ? [...prev, { ...pricelist, sellerName: 'Global' }] : [{ ...pricelist, sellerName: 'Global' }]);
    setIsCreateModalOpen(false);
    setNewPricelist({ name: '', description: '', currency: 'USD', items: [] });

    auditService.logAction(
      { id: user.id, name: user.fullName, role: 'admin' },
      'CREATE',
      'pricelist',
      `Admin created global pricelist: ${pricelist.name}`,
      'success',
      pricelist.id
    );
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
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus size={18} />}
        >
          Create Global Pricelist
        </Button>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Global Pricelist"
        size="lg"
      >
        <form onSubmit={handleCreatePricelist} className="space-y-6">
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
                value={newPricelist.currency || 'USD'}
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
            Create Global Pricelist
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
                <span className="text-xs font-medium text-brand-dark/60">{pl.items.length} Products</span>
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
                <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" icon={<Edit2 size={16} />} />
                  <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} className="text-red-500 hover:text-red-600" onClick={() => deletePricelist(pl.id)} />
                  <Button variant="ghost" size="sm" icon={<MoreVertical size={16} />} />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default AdminPricelistManagement;
