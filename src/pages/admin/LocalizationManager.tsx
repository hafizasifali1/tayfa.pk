import React, { useState, useEffect } from 'react';
import { 
  Globe, Plus, Search, Edit2, Trash2, 
  CheckCircle2, AlertCircle, Info, X, Save, 
  Languages, FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

interface Localization {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  translations: Record<string, string>;
  createdAt: string;
}

const LocalizationManager = () => {
  const [localizations, setLocalizations] = useState<Localization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLoc, setCurrentLoc] = useState<Partial<Localization> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLocalizations();
  }, []);

  const fetchLocalizations = async () => {
    try {
      const response = await axios.get('/api/localizations');
      if (Array.isArray(response.data)) {
        setLocalizations(response.data);
      } else {
        setLocalizations([]);
      }
    } catch (error) {
      console.error('Error fetching localizations:', error);
      setLocalizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentLoc({
      code: '',
      name: '',
      isDefault: false,
      isActive: true,
      translations: {
        'home': 'Home',
        'shop': 'Shop',
        'cart': 'Cart',
        'checkout': 'Checkout',
        'account': 'Account'
      }
    });
    setIsEditing(true);
  };

  const handleEdit = (loc: Localization) => {
    setCurrentLoc({ ...loc });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentLoc?.code || !currentLoc?.name) return;
    try {
      if (currentLoc.id) {
        await axios.patch(`/api/localizations/${currentLoc.id}`, currentLoc);
      } else {
        await axios.post('/api/localizations', currentLoc);
      }
      setIsEditing(false);
      fetchLocalizations();
    } catch (error) {
      console.error('Error saving localization:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this localization?')) return;
    try {
      await axios.delete(`/api/localizations/${id}`);
      fetchLocalizations();
    } catch (error) {
      console.error('Error deleting localization:', error);
    }
  };

  const filteredLocalizations = Array.isArray(localizations) ? localizations.filter(l => {
    try {
      const name = l?.name || '';
      const code = l?.code || '';
      const query = searchQuery.toLowerCase();
      return name.toLowerCase().includes(query) || code.toLowerCase().includes(query);
    } catch (err) {
      console.error('Error filtering localization:', err, l);
      return false;
    }
  }) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-brand-dark">Localization Manager</h1>
          <p className="text-brand-dark/60">Manage languages and translations for your store.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
        >
          <Plus size={18} />
          <span>Add Language</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-dark/5">
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={20} />
            <input
              type="text"
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-brand-cream/30 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold/20 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 text-center">
              <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredLocalizations.length === 0 ? (
            <div className="col-span-full py-12 text-center text-brand-dark/40 italic">No languages found.</div>
          ) : (
            filteredLocalizations.map((loc) => (
              <div key={loc.id} className="p-6 rounded-3xl border border-brand-dark/5 bg-brand-cream/10 hover:border-brand-gold/20 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold">
                      {loc.code.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark">{loc.name}</h3>
                      {loc.isDefault && (
                        <span className="text-[8px] font-bold uppercase tracking-widest bg-brand-gold text-white px-2 py-0.5 rounded">Default</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(loc)} className="p-2 text-brand-dark/40 hover:text-brand-gold transition-colors">
                      <Edit2 size={16} />
                    </button>
                    {!loc.isDefault && (
                      <button onClick={() => handleDelete(loc.id)} className="p-2 text-brand-dark/40 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-brand-dark/40">
                    <span>Status</span>
                    <span className={loc.isActive ? 'text-emerald-500' : 'text-rose-500'}>
                      {loc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-brand-dark/40">
                    <span>Translations</span>
                    <span>{Object.keys(loc.translations || {}).length} keys</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && currentLoc && (
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
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-2xl font-serif text-brand-dark">
                    {currentLoc.id ? 'Edit Language' : 'Add New Language'}
                  </h2>
                  <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold mt-1">
                    {currentLoc.id ? `ID: ${currentLoc.id}` : 'New Localization Entry'}
                  </p>
                </div>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-brand-cream rounded-full transition-colors">
                  <X size={24} className="text-brand-dark/40" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Language Name</label>
                      <input
                        type="text"
                        value={currentLoc.name || ''}
                        onChange={(e) => setCurrentLoc({...currentLoc, name: e.target.value})}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                        placeholder="e.g. English"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Language Code (ISO)</label>
                      <input
                        type="text"
                        value={currentLoc.code || ''}
                        onChange={(e) => setCurrentLoc({...currentLoc, code: e.target.value})}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                        placeholder="e.g. en"
                      />
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={!!currentLoc.isDefault}
                          onChange={(e) => setCurrentLoc({...currentLoc, isDefault: e.target.checked})}
                          className="w-4 h-4 text-brand-gold border-brand-dark/10 rounded focus:ring-brand-gold"
                        />
                        <label htmlFor="isDefault" className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Set as Default</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={!!currentLoc.isActive}
                          onChange={(e) => setCurrentLoc({...currentLoc, isActive: e.target.checked})}
                          className="w-4 h-4 text-brand-gold border-brand-dark/10 rounded focus:ring-brand-gold"
                        />
                        <label htmlFor="isActive" className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Active</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60">Translations</label>
                      <button 
                        onClick={() => {
                          const key = window.prompt('Enter translation key:');
                          if (key) setCurrentLoc({...currentLoc, translations: {...currentLoc.translations, [key]: ''}});
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors"
                      >
                        Add Key
                      </button>
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {Object.entries(currentLoc.translations || {}).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-brand-dark/40">{key}</span>
                            <button 
                              onClick={() => {
                                const newTranslations = { ...currentLoc.translations };
                                delete newTranslations[key];
                                setCurrentLoc({...currentLoc, translations: newTranslations});
                              }}
                              className="text-rose-500 hover:text-rose-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => setCurrentLoc({
                              ...currentLoc, 
                              translations: {...currentLoc.translations, [key]: e.target.value}
                            })}
                            className="w-full px-4 py-2 bg-brand-cream/30 border-none rounded-xl text-sm"
                          />
                        </div>
                      ))}
                    </div>
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
                  Save Language
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocalizationManager;
