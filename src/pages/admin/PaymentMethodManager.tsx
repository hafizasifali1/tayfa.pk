import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, Search, Filter, MoreVertical, 
  Edit2, Trash2, CheckCircle2, XCircle, Info,
  Save, X, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { PaymentMethod } from '../../types';

const PaymentMethodManager = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    name: '',
    description: '',
    isActive: true,
    type: 'manual',
    instructions: '',
    icon: ''
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/payment-methods');
      if (Array.isArray(response.data)) {
        setMethods(response.data);
      } else {
        console.error('Payment methods response is not an array:', response.data);
        setMethods([]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      setFormData(method);
    } else {
      setEditingMethod(null);
      setFormData({
        name: '',
        description: '',
        isActive: true,
        type: 'manual',
        instructions: '',
        icon: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMethod) {
        await axios.patch(`/api/payment-methods/${editingMethod.id}`, formData);
      } else {
        await axios.post('/api/payment-methods', formData);
      }
      fetchMethods();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/payment-methods/${id}`);
      fetchMethods();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const toggleStatus = async (method: PaymentMethod) => {
    try {
      await axios.patch(`/api/payment-methods/${method.id}`, {
        isActive: !method.isActive
      });
      fetchMethods();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const filteredMethods = Array.isArray(methods) ? methods.filter(m => {
    try {
      const name = m?.name || '';
      const description = m?.description || '';
      const query = searchTerm.toLowerCase();
      return name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
    } catch (err) {
      console.error('Error filtering payment method:', err, m);
      return false;
    }
  }) : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">Payment Methods</h1>
          <p className="text-brand-dark/60">Manage how your customers pay for their orders.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10"
        >
          <Plus size={20} />
          <span className="font-bold uppercase tracking-widest text-sm">Add Method</span>
        </button>
      </div>

      {/* Stats/Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm text-brand-dark/40 font-bold uppercase tracking-widest">Total Methods</p>
              <p className="text-2xl font-serif font-bold text-brand-dark">{Array.isArray(methods) ? methods.length : 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-brand-dark/40 font-bold uppercase tracking-widest">Active</p>
              <p className="text-2xl font-serif font-bold text-brand-dark">{Array.isArray(methods) ? methods.filter(m => m.isActive).length : 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-brand-cream text-brand-dark/40 rounded-2xl">
              <Info size={24} />
            </div>
            <div>
              <p className="text-sm text-brand-dark/40 font-bold uppercase tracking-widest">Manual Methods</p>
              <p className="text-2xl font-serif font-bold text-brand-dark">{Array.isArray(methods) ? methods.filter(m => m.type === 'manual').length : 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-3xl border border-brand-dark/5 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" size={20} />
          <input 
            type="text"
            placeholder="Search payment methods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-cream/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-gold/20"
          />
        </div>
        <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-brand-cream text-brand-dark rounded-2xl hover:bg-brand-dark hover:text-white transition-all">
          <Filter size={18} />
          <span className="font-bold uppercase tracking-widest text-xs">Filters</span>
        </button>
      </div>

      {/* Methods List */}
      <div className="bg-white rounded-3xl border border-brand-dark/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/50 border-b border-brand-dark/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">Method</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-brand-dark/40 font-medium">Loading methods...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMethods.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-brand-cream rounded-full text-brand-dark/20">
                        <CreditCard size={48} />
                      </div>
                      <p className="text-brand-dark/40 font-medium">No payment methods found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMethods.map((method) => (
                  <tr key={method.id} className="hover:bg-brand-cream/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-cream flex items-center justify-center text-brand-dark">
                          {method.icon ? (
                            <img src={method.icon} alt={method.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <CreditCard size={24} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-brand-dark">{method.name}</p>
                          <p className="text-xs text-brand-dark/40 line-clamp-1">{method.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        method.type === 'manual' 
                          ? 'bg-blue-500/10 text-blue-600' 
                          : 'bg-brand-gold/10 text-brand-gold'
                      }`}>
                        {method.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(method)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
                          method.isActive 
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                        }`}
                      >
                        {method.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {method.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleOpenModal(method)}
                          className="p-2 text-brand-dark/40 hover:text-brand-gold hover:bg-brand-gold/10 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(method.id)}
                          className="p-2 text-brand-dark/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-brand-cream/30">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-brand-dark">
                    {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                  </h2>
                  <p className="text-sm text-brand-dark/40">Configure payment option details.</p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="p-3 bg-white text-brand-dark/40 hover:text-brand-dark rounded-2xl transition-all shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Method Name</label>
                    <input 
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-cream/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-gold/20"
                      placeholder="e.g. Cash on Delivery"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Method Type</label>
                    <select 
                      value={formData.type || 'manual'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-6 py-4 bg-brand-cream/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-gold/20"
                    >
                      <option value="manual">Manual (COD, Bank Transfer)</option>
                      <option value="gateway">Gateway (Stripe, PayPal)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Description</label>
                  <textarea 
                    required
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-brand-cream/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-gold/20 min-h-[100px]"
                    placeholder="Short description for customers..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Instructions (Optional)</label>
                  <textarea 
                    value={formData.instructions || ''}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-6 py-4 bg-brand-cream/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-gold/20 min-h-[100px]"
                    placeholder="Instructions shown after selection..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Icon URL (Optional)</label>
                    <input 
                      type="text"
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-cream/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-gold/20"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center space-x-4 pt-8">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all ${
                        !!formData.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      {!!formData.isActive ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {!!formData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 flex space-x-4">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-grow px-8 py-4 bg-brand-cream text-brand-dark rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand-dark hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-grow px-8 py-4 bg-brand-dark text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10 flex items-center justify-center space-x-2"
                  >
                    <Save size={18} />
                    <span>{editingMethod ? 'Update Method' : 'Save Method'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-serif text-brand-dark mb-2">Delete Payment Method?</h3>
              <p className="text-sm text-brand-dark/60 mb-8">
                This action cannot be undone. This payment method will no longer be available for customers.
              </p>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-brand-dark/60 hover:bg-brand-cream transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentMethodManager;
