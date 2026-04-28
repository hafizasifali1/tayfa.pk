import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2,
  ChevronRight, Save, X, Globe, Info, AlertCircle,
  List, CheckSquare, ChevronDown, Sliders, SlidersHorizontal, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { Filter, FilterValue } from '../../types';

interface CategoryOption {
  id: string;
  name: string;
}

const FilterManager = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<Partial<Filter> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<CategoryOption[]>([]);

  // Filter Values State
  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);
  const [isEditingValues, setIsEditingValues] = useState(false);
  const [activeFilterForValues, setActiveFilterForValues] = useState<Filter | null>(null);
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetchFilters();
    fetchParentCategories();
  }, []);

  const fetchFilters = async () => {
    try {
      const response = await axios.get('/api/filters');
      if (Array.isArray(response.data)) {
        setFilters(response.data);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (Array.isArray(response.data)) {
        setParentCategories(
          response.data
            .filter((c: any) => !c.parentId)
            .map((c: any) => ({ id: c.id, name: c.name }))
        );
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFilterValues = async (filterId: string) => {
    try {
      const response = await axios.get(`/api/filter-values?filterId=${filterId}`);
      if (Array.isArray(response.data)) {
        setFilterValues(response.data);
      }
    } catch (error) {
      console.error('Error fetching filter values:', error);
    }
  };

  const handleEdit = (filter: Filter) => {
    setCurrentFilter({ ...filter });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentFilter({
      name: '',
      type: 'checkbox',
      displayOrder: filters.length + 1,
      isActive: true,
      labels: {},
      categoryId: null,
      isFilterable: false,
      isAttribute: false,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentFilter?.name) return;

    try {
      if (currentFilter.id) {
        await axios.patch(`/api/filters/${currentFilter.id}`, currentFilter);
      } else {
        await axios.post('/api/filters', currentFilter);
      }
      setIsEditing(false);
      fetchFilters();
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/filters/${id}`);
      setShowDeleteConfirm(null);
      fetchFilters();
    } catch (error) {
      console.error('Error deleting filter:', error);
    }
  };

  const handleManageValues = (filter: Filter) => {
    setActiveFilterForValues(filter);
    fetchFilterValues(filter.id);
    setIsEditingValues(true);
  };

  const handleAddValue = async () => {
    if (!newValue.trim() || !activeFilterForValues) return;
    try {
      await axios.post('/api/filter-values', {
        filterId: activeFilterForValues.id,
        value: newValue.trim(),
        displayOrder: filterValues.length + 1,
        labels: {}
      });
      setNewValue('');
      fetchFilterValues(activeFilterForValues.id);
    } catch (error) {
      console.error('Error adding filter value:', error);
    }
  };

  const handleDeleteValue = async (id: string) => {
    try {
      await axios.delete(`/api/filter-values/${id}`);
      if (activeFilterForValues) fetchFilterValues(activeFilterForValues.id);
    } catch (error) {
      console.error('Error deleting filter value:', error);
    }
  };

  const filteredFilters = filters.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'dropdown': return <ChevronDown size={16} />;
      case 'checkbox': return <CheckSquare size={16} />;
      case 'range': return <Sliders size={16} />;
      case 'multi-select': return <List size={16} />;
      default: return <List size={16} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-brand-dark">Product Filters</h1>
          <p className="text-brand-dark/60">Manage dynamic filters for your marketplace.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
        >
          <Plus size={18} />
          <span>Add New Filter</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-dark/5">
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={20} />
            <input
              type="text"
              placeholder="Search filters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-brand-cream/30 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold/20 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-brand-dark/5">
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Order</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Filter Name</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Type</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Usage</th>
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
              ) : filteredFilters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-dark/40 italic">No filters found.</td>
                </tr>
              ) : (
                filteredFilters.map((filter) => (
                  <tr key={filter.id} className="group hover:bg-brand-cream/20 transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-xs font-mono text-brand-dark/40">#{filter.displayOrder}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-brand-dark">{filter.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 text-brand-dark/60">
                        {getFilterIcon(filter.type)}
                        <span className="text-[10px] font-bold uppercase tracking-widest">{filter.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {filter.isFilterable && (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                            <SlidersHorizontal size={10} />
                            <span>Sidebar</span>
                          </span>
                        )}
                        {filter.isAttribute && (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-violet-50 text-violet-600 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                            <Tag size={10} />
                            <span>Detail</span>
                          </span>
                        )}
                        {!filter.isFilterable && !filter.isAttribute && (
                          <span className="text-[10px] text-brand-dark/20">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${filter.isActive ? 'bg-emerald-500' : 'bg-brand-dark/20'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                          {filter.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleManageValues(filter)}
                          className="p-2 text-brand-dark/60 hover:text-brand-gold transition-colors flex items-center space-x-1"
                          title="Manage Values"
                        >
                          <List size={18} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Values</span>
                        </button>
                        <button 
                          onClick={() => handleEdit(filter)}
                          className="p-2 text-brand-dark/60 hover:text-brand-gold transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(filter.id)}
                          className="p-2 text-brand-dark/60 hover:text-rose-500 transition-colors"
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

      {/* Filter Edit Modal */}
      <AnimatePresence>
        {isEditing && currentFilter && (
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
              className="relative w-full max-w-2xl bg-brand-cream rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-2xl font-serif text-brand-dark">
                    {currentFilter.id ? 'Edit Filter' : 'Add New Filter'}
                  </h2>
                  <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold mt-1">
                    Configure filter properties and behavior.
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
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Filter Name *</label>
                      <input
                        type="text"
                        value={currentFilter.name || ''}
                        onChange={(e) => setCurrentFilter(prev => ({ ...prev!, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                        placeholder="e.g. Color, Size, Brand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Filter Type</label>
                      <select
                        value={currentFilter.type || 'checkbox'}
                        onChange={(e) => setCurrentFilter(prev => ({ ...prev!, type: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                      >
                        <option value="checkbox">Checkbox (Multi-select)</option>
                        <option value="dropdown">Dropdown (Single-select)</option>
                        <option value="multi-select">Multi-select List</option>
                        <option value="range">Range (Numeric)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Display Order</label>
                      <input
                        type="number"
                        value={currentFilter.displayOrder ?? ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setCurrentFilter(prev => ({ ...prev!, displayOrder: isNaN(val) ? 0 : val }));
                        }}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-3 pt-4">
                      <button
                        onClick={() => setCurrentFilter(prev => ({ ...prev!, isActive: !prev?.isActive }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${currentFilter.isActive ? 'bg-emerald-500' : 'bg-brand-dark/20'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${currentFilter.isActive ? 'left-7' : 'left-1'}`} />
                      </button>
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Active Status</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-brand-dark/5 pt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Category (optional)</label>
                    <select
                      value={currentFilter.categoryId || ''}
                      onChange={(e) => setCurrentFilter(prev => ({ ...prev!, categoryId: e.target.value || null }))}
                      className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                    >
                      <option value="">All Categories</option>
                      {parentCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setCurrentFilter(prev => ({ ...prev!, isFilterable: !prev?.isFilterable }))}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${currentFilter.isFilterable ? 'bg-blue-500' : 'bg-brand-dark/20'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${currentFilter.isFilterable ? 'left-7' : 'left-1'}`} />
                      </button>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Show in Shop Sidebar</span>
                        <p className="text-[10px] text-brand-dark/30 mt-0.5">Visible as a filter option on the shop page</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setCurrentFilter(prev => ({ ...prev!, isAttribute: !prev?.isAttribute }))}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${currentFilter.isAttribute ? 'bg-violet-500' : 'bg-brand-dark/20'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${currentFilter.isAttribute ? 'left-7' : 'left-1'}`} />
                      </button>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Show on Product Detail Page</span>
                        <p className="text-[10px] text-brand-dark/30 mt-0.5">Displayed as a product attribute/spec</p>
                      </div>
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
                  Save Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Values Modal */}
      <AnimatePresence>
        {isEditingValues && activeFilterForValues && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingValues(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-cream rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-2xl font-serif text-brand-dark">
                    Manage Values: {activeFilterForValues.name}
                  </h2>
                  <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold mt-1">
                    Add or remove options for this filter.
                  </p>
                </div>
                <button onClick={() => setIsEditingValues(false)} className="p-2 hover:bg-brand-cream rounded-full transition-colors">
                  <X size={24} className="text-brand-dark/40" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddValue()}
                    placeholder="Enter new value (e.g. Red, XL, Nike)"
                    className="flex-1 px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                  />
                  <button
                    onClick={handleAddValue}
                    className="bg-brand-dark text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {filterValues.map((val) => (
                    <div key={val.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-brand-dark/5 group">
                      <span className="font-bold text-brand-dark">{val.value}</span>
                      <button
                        onClick={() => handleDeleteValue(val.id)}
                        className="p-2 text-brand-dark/20 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {filterValues.length === 0 && (
                    <p className="text-center py-8 text-brand-dark/40 italic">No values defined yet.</p>
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-brand-dark/5 bg-white flex items-center justify-end">
                <button 
                  onClick={() => setIsEditingValues(false)}
                  className="px-10 py-4 bg-brand-dark text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
                >
                  Done
                </button>
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
              <h3 className="text-2xl font-serif text-brand-dark mb-2">Delete Filter?</h3>
              <p className="text-sm text-brand-dark/60 mb-8">
                This will also delete all associated values and mappings. This action cannot be undone.
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

export default FilterManager;
