import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Globe, Save, X, 
  AlertCircle, DollarSign, History, Check, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { Country, CurrencyRate } from '../../types';

const CountryManager = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<Partial<Country> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showRateHistory, setShowRateHistory] = useState<string | null>(null);
  const [rateHistory, setRateHistory] = useState<CurrencyRate[]>([]);
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [newRate, setNewRate] = useState({ rate: '', effectiveDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await axios.get('/api/countries');
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (country: Country) => {
    setCurrentCountry({ ...country });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentCountry({
      name: '',
      code: '',
      currency: '',
      currencyName: '',
      currencySymbol: '',
      isActive: true
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentCountry?.name || !currentCountry?.code || !currentCountry?.currency) return;

    try {
      if (currentCountry.id) {
        await axios.patch(`/api/countries/${currentCountry.id}`, currentCountry);
      } else {
        await axios.post('/api/countries', currentCountry);
      }
      setIsEditing(false);
      fetchCountries();
    } catch (error) {
      console.error('Error saving country:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/countries/${id}`);
      setShowDeleteConfirm(null);
      fetchCountries();
    } catch (error) {
      console.error('Error deleting country:', error);
    }
  };

  const fetchRateHistory = async (currencyCode: string) => {
    try {
      const response = await axios.get(`/api/currency-rates?currencyCode=${currencyCode}`);
      setRateHistory(response.data);
      setShowRateHistory(currencyCode);
    } catch (error) {
      console.error('Error fetching rate history:', error);
    }
  };

  const handleAddRate = async () => {
    if (!showRateHistory || !newRate.rate) return;
    try {
      await axios.post('/api/currency-rates', {
        currencyCode: showRateHistory,
        rate: newRate.rate,
        effectiveDate: newRate.effectiveDate
      });
      setIsAddingRate(false);
      setNewRate({ rate: '', effectiveDate: new Date().toISOString().split('T')[0] });
      fetchRateHistory(showRateHistory);
    } catch (error) {
      console.error('Error adding rate:', error);
    }
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-brand-dark">Country & Currency</h1>
          <p className="text-brand-dark/60">Manage active countries and their exchange rates.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
        >
          <Plus size={18} />
          <span>Add New Country</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-dark/5">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={20} />
          <input
            type="text"
            placeholder="Search countries, codes or currencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-brand-cream/30 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold/20 text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-brand-dark/5">
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Country</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Code</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Currency</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Symbol</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Status</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredCountries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-dark/40 italic">No countries found.</td>
                </tr>
              ) : (
                filteredCountries.map((country) => (
                  <tr key={country.id} className="group hover:bg-brand-cream/20 transition-colors">
                    <td className="py-4 px-4 font-bold text-brand-dark">{country.name}</td>
                    <td className="py-4 px-4">
                      <code className="text-[10px] bg-brand-dark/5 px-2 py-1 rounded text-brand-dark/60">{country.code}</code>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-brand-dark">{country.currency}</span>
                        <span className="text-[10px] text-brand-dark/40">{country.currencyName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-brand-gold">{country.currencySymbol}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${country.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {country.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => fetchRateHistory(country.currency)}
                          className="p-2 text-brand-dark/60 hover:text-brand-gold transition-colors"
                          title="Currency Rates"
                        >
                          <DollarSign size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(country)}
                          className="p-2 text-brand-dark/60 hover:text-brand-gold transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(country.id)}
                          className="p-2 text-brand-dark/60 hover:text-rose-500 transition-colors"
                          title="Delete"
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

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && currentCountry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-cream rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-2xl font-serif text-brand-dark">
                    {currentCountry.id ? 'Edit Country' : 'Add New Country'}
                  </h2>
                </div>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-brand-cream rounded-full transition-colors">
                  <X size={24} className="text-brand-dark/40" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Country Name *</label>
                    <input
                      type="text"
                      value={currentCountry.name || ''}
                      onChange={(e) => setCurrentCountry({...currentCountry, name: e.target.value})}
                      className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                      placeholder="e.g. Pakistan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Country Code *</label>
                    <input
                      type="text"
                      value={currentCountry.code || ''}
                      onChange={(e) => setCurrentCountry({...currentCountry, code: e.target.value.toUpperCase()})}
                      maxLength={10}
                      className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                      placeholder="e.g. PK"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Currency Code *</label>
                    <input
                      type="text"
                      value={currentCountry.currency || ''}
                      onChange={(e) => setCurrentCountry({...currentCountry, currency: e.target.value.toUpperCase()})}
                      maxLength={10}
                      className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                      placeholder="e.g. PKR"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Currency Name *</label>
                    <input
                      type="text"
                      value={currentCountry.currencyName || ''}
                      onChange={(e) => setCurrentCountry({...currentCountry, currencyName: e.target.value})}
                      className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                      placeholder="e.g. Pakistani Rupee"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Currency Symbol *</label>
                    <input
                      type="text"
                      value={currentCountry.currencySymbol || ''}
                      onChange={(e) => setCurrentCountry({...currentCountry, currencySymbol: e.target.value})}
                      className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                      placeholder="e.g. Rs."
                    />
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-brand-dark/5 self-end">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={!!currentCountry.isActive}
                      onChange={(e) => setCurrentCountry({...currentCountry, isActive: e.target.checked})}
                      className="w-5 h-5 text-brand-gold border-brand-dark/10 rounded focus:ring-brand-gold"
                    />
                    <label htmlFor="isActive" className="text-xs font-bold uppercase tracking-widest text-brand-dark/60 cursor-pointer">
                      Active Status
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-brand-dark/5 bg-white flex items-center justify-end space-x-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-brand-dark/60 hover:bg-brand-cream transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-10 py-4 bg-brand-dark text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
                >
                  Save Country
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rate History Modal */}
      <AnimatePresence>
        {showRateHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRateHistory(null)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-cream rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  <History className="text-brand-gold" size={24} />
                  <h2 className="text-2xl font-serif text-brand-dark">
                    Rate History: {showRateHistory}
                  </h2>
                </div>
                <button onClick={() => setShowRateHistory(null)} className="p-2 hover:bg-brand-cream rounded-full transition-colors">
                  <X size={24} className="text-brand-dark/40" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Historical Rates</h3>
                  <button 
                    onClick={() => setIsAddingRate(!isAddingRate)}
                    className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add New Rate</span>
                  </button>
                </div>

                <AnimatePresence>
                  {isAddingRate && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-white rounded-3xl border border-brand-gold/20 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-1">Exchange Rate (vs Base)</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={newRate.rate || ''}
                              onChange={(e) => setNewRate({...newRate, rate: e.target.value})}
                              className="w-full px-4 py-2 border border-brand-dark/10 rounded-xl text-sm"
                              placeholder="0.0036"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-1">Effective Date</label>
                            <input
                              type="date"
                              value={newRate.effectiveDate}
                              onChange={(e) => setNewRate({...newRate, effectiveDate: e.target.value})}
                              className="w-full px-4 py-2 border border-brand-dark/10 rounded-xl text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => setIsAddingRate(false)}
                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleAddRate}
                            className="px-6 py-2 bg-brand-dark text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
                          >
                            Add Rate
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {rateHistory.map((rate, idx) => (
                    <div key={rate.id} className={`p-4 rounded-2xl flex items-center justify-between ${idx === 0 ? 'bg-brand-gold/10 border border-brand-gold/20' : 'bg-white border border-brand-dark/5'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-brand-gold text-white' : 'bg-brand-cream text-brand-dark/40'}`}>
                          {idx === 0 ? <Check size={20} /> : <Activity size={20} />}
                        </div>
                        <div>
                          <p className="text-lg font-mono font-bold text-brand-dark">{rate.rate}</p>
                          <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">
                            {idx === 0 ? 'Current Rate' : 'Previous Rate'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-brand-dark">
                          {new Date(rate.effectiveDate).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">Effective Date</p>
                      </div>
                    </div>
                  ))}
                  {rateHistory.length === 0 && (
                    <p className="text-center py-8 text-brand-dark/40 italic">No rate history found.</p>
                  )}
                </div>
              </div>
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
              <h3 className="text-2xl font-serif text-brand-dark mb-2">Delete Country?</h3>
              <p className="text-sm text-brand-dark/60 mb-8">
                This will remove the country and its currency settings. This action cannot be undone.
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

export default CountryManager;
