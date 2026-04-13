import React, { useState, useEffect } from 'react';
import { 
  Percent, Plus, Search, Filter, MoreVertical, Edit2, Trash2, 
  CheckCircle2, XCircle, AlertCircle, Loader2, Globe, MapPin,
  FileText, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { TaxRule, Pricelist } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const TaxManager = () => {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [pricelists, setPricelists] = useState<Pricelist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    state: '',
    rate: 0,
    pricelistId: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [taxRes, priceRes] = await Promise.all([
        axios.get('/api/tax-rules'),
        axios.get('/api/pricelists')
      ]);
      if (Array.isArray(taxRes.data)) {
        setTaxRules(taxRes.data);
      } else {
        console.error('Tax rules response is not an array:', taxRes.data);
        setTaxRules([]);
      }
      if (Array.isArray(priceRes.data)) {
        setPricelists(priceRes.data);
      } else {
        console.error('Pricelists response is not an array:', priceRes.data);
        setPricelists([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (rule?: TaxRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        country: rule.country,
        state: rule.state || '',
        rate: rule.rate,
        pricelistId: rule.pricelistId,
        isActive: rule.isActive
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        country: '',
        state: '',
        rate: 0,
        pricelistId: pricelists[0]?.id || '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingRule) {
        await axios.patch(`/api/tax-rules/${editingRule.id}`, formData);
      } else {
        await axios.post('/api/tax-rules', formData);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving tax rule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/tax-rules/${id}`);
      await fetchData();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting tax rule:', error);
    }
  };

  const toggleStatus = async (rule: TaxRule) => {
    try {
      await axios.patch(`/api/tax-rules/${rule.id}`, { isActive: !rule.isActive });
      await fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const filteredRules = Array.isArray(taxRules) ? taxRules.filter(rule => 
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.country.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif mb-2">Tax Management</h1>
          <p className="text-brand-dark/60">Configure country and state-based tax rules for your pricelists.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Tax Rule</span>
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" size={20} />
            <input 
              type="text"
              placeholder="Search tax rules by name or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-brand-cream/30 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold/20"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter size={20} />
            <span>Filter</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-brand-gold" size={40} />
            <p className="text-brand-dark/40 font-bold uppercase tracking-widest text-xs">Loading tax rules...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="text-center py-20 bg-brand-cream/20 rounded-[2rem] border-2 border-dashed border-brand-dark/5">
            <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4 text-brand-dark/20">
              <Percent size={32} />
            </div>
            <h3 className="text-xl font-serif mb-2">No tax rules found</h3>
            <p className="text-brand-dark/40 max-w-xs mx-auto mb-8">
              {searchTerm ? "We couldn't find any tax rules matching your search." : "Start by adding your first tax rule to the system."}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>Clear Search</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-brand-dark/5">
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-brand-dark/40 px-4">Tax Rule</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-brand-dark/40 px-4">Region</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-brand-dark/40 px-4">Rate</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-brand-dark/40 px-4">Pricelist</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-brand-dark/40 px-4">Status</th>
                  <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-brand-dark/40 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="group hover:bg-brand-cream/30 transition-colors">
                    <td className="py-6 px-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold">
                          <Percent size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-brand-dark">{rule.name}</p>
                          <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mt-1">ID: {rule.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Globe size={14} className="text-brand-dark/40" />
                        <span>{rule.country}</span>
                        {rule.state && (
                          <>
                            <ChevronRight size={12} className="text-brand-dark/20" />
                            <span className="text-brand-dark/60">{rule.state}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className="text-lg font-serif font-bold text-brand-gold">{rule.rate}%</span>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center space-x-2">
                        <FileText size={14} className="text-brand-dark/40" />
                        <span className="text-sm">
                          {(Array.isArray(pricelists) ? pricelists.find(p => p.id === rule.pricelistId) : null)?.name || 'Unknown Pricelist'}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <button 
                        onClick={() => toggleStatus(rule)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                          rule.isActive 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        {rule.isActive ? (
                          <><CheckCircle2 size={12} /> <span>Active</span></>
                        ) : (
                          <><XCircle size={12} /> <span>Inactive</span></>
                        )}
                      </button>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleOpenModal(rule)}
                          className="p-2 text-brand-dark/40 hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(rule.id)}
                          className="p-2 text-brand-dark/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-brand-dark/5 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold">
                    <Percent size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif">{editingRule ? 'Edit Tax Rule' : 'Add New Tax Rule'}</h2>
                    <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold">Configure taxation details</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-cream rounded-full transition-colors">
                  <XCircle size={24} className="text-brand-dark/20" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Rule Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20"
                      placeholder="e.g., US Sales Tax"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Tax Rate (%)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={formData.rate || 0}
                      onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value)})}
                      className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20"
                      placeholder="e.g., 7.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Country (ISO Code)</label>
                    <input 
                      required
                      type="text"
                      value={formData.country || ''}
                      onChange={(e) => setFormData({...formData, country: e.target.value.toUpperCase()})}
                      className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20"
                      placeholder="e.g., US"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">State/Province (Optional)</label>
                    <input 
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20"
                      placeholder="e.g., California"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Linked Pricelist</label>
                    <select 
                      required
                      value={formData.pricelistId || ''}
                      onChange={(e) => setFormData({...formData, pricelistId: e.target.value})}
                      className="w-full bg-brand-cream/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/20"
                    >
                      <option value="">Select a pricelist</option>
                      {Array.isArray(pricelists) && pricelists.map(pl => (
                        <option key={pl.id} value={pl.id}>{pl.name} ({pl.currency})</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-brand-dark/40 italic mt-2 ml-4">
                      This tax rule will only be available for products using the selected pricelist.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-brand-cream/30 rounded-2xl">
                  <input 
                    type="checkbox"
                    id="isActive"
                    checked={!!formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 rounded border-brand-dark/10 text-brand-gold focus:ring-brand-gold"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-brand-dark">This tax rule is active and available for use</label>
                </div>

                <div className="pt-4 flex space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-grow"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-grow flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        <span>{editingRule ? 'Update Rule' : 'Create Rule'}</span>
                      </>
                    )}
                  </Button>
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
              <h3 className="text-2xl font-serif text-brand-dark mb-2">Delete Tax Rule?</h3>
              <p className="text-sm text-brand-dark/60 mb-8">
                This action cannot be undone. This tax rule will no longer be applied to new orders.
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

export default TaxManager;
