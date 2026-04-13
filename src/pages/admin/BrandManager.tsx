import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Image as ImageIcon, 
  ChevronRight, Save, X, Globe, Info, AlertCircle, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { Brand, SEOMetadata } from '../../types';
// import SEOSettingsForm from '../../components/admin/SEO/SEOSettingsForm';

const BrandManager = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this-week' | 'this-month'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [isEditing, setIsEditing] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<Partial<Brand> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      if (Array.isArray(response.data)) {
        setBrands(response.data);
      } else {
        console.error('Brands response is not an array:', response.data);
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setCurrentBrand({ ...brand });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentBrand({
      name: '',
      slug: '',
      logo: '',
      description: '',
      seo: {
        title: '',
        description: '',
        keywords: '',
        robots: 'index, follow'
      }
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentBrand?.name || !currentBrand?.slug) return;

    try {
      if (currentBrand.id) {
        await axios.patch(`/api/brands/${currentBrand.id}`, currentBrand);
      } else {
        await axios.post('/api/brands', currentBrand);
      }
      setIsEditing(false);
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/brands/${id}`);
      setShowDeleteConfirm(null);
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  const filteredBrands = Array.isArray(brands) ? brands.filter(brand => {
    try {
      const name = brand?.name || '';
      const slug = brand?.slug || '';
      const query = searchQuery.toLowerCase();
      
      // Search filter
      const matchesSearch = name.toLowerCase().includes(query) || slug.toLowerCase().includes(query);
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && brand.isActive !== false) || 
        (statusFilter === 'inactive' && brand.isActive === false);
        
      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all' && brand.createdAt) {
        const createdDate = new Date(brand.createdAt);
        const now = new Date();
        if (dateFilter === 'today') {
          matchesDate = createdDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'this-week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = createdDate >= weekAgo;
        } else if (dateFilter === 'this-month') {
          matchesDate = createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    } catch (err) {
      console.error('Error filtering brand:', err, brand);
      return false;
    }
  }).sort((a, b) => {
    if (sortOrder === 'name-asc') return (a.name || '').localeCompare(b.name || '');
    if (sortOrder === 'name-desc') return (b.name || '').localeCompare(a.name || '');
    
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    
    if (sortOrder === 'newest') return dateB - dateA;
    if (sortOrder === 'oldest') return dateA - dateB;
    
    return 0;
  }) : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentBrand(prev => {
      if (!prev) return null;
      const newData = { ...prev, [name]: value };
      
      // Auto-generate slug if name changes and slug is empty or matches previous name slug
      if (name === 'name' && (!prev.slug || prev.slug === prev.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))) {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      
      return newData;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for base64
        alert('Logo file size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCurrentBrand(prev => prev ? ({ ...prev, logo: base64String }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-brand-dark">Brand Management</h1>
          <p className="text-brand-dark/60">Manage your partner brands and their search presence.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
        >
          <Plus size={18} />
          <span>Add New Brand</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-dark/5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={20} />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-brand-cream/30 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold/20 text-sm"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-4 bg-brand-cream/30 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold/20 text-xs font-bold uppercase tracking-widest text-brand-dark/60"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-4 py-4 bg-brand-cream/30 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold/20 text-xs font-bold uppercase tracking-widest text-brand-dark/60"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-4 py-4 bg-brand-cream/30 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold/20 text-xs font-bold uppercase tracking-widest text-brand-dark/60"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-brand-dark/5">
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Logo</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Brand Name</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Slug</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Status</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Created</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">SEO Status</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-dark/40 italic">No brands found.</td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="group hover:bg-brand-cream/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-cream flex items-center justify-center overflow-hidden border border-brand-dark/5">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                        ) : (
                          <ImageIcon className="text-brand-dark/20" size={20} />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-brand-dark">{brand.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-[10px] bg-brand-dark/5 px-2 py-1 rounded text-brand-dark/60">/{brand.slug}</code>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${brand.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {brand.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[10px] font-medium text-brand-dark/60">
                        {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${brand.seo?.title ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                          {brand.seo?.title ? 'Optimized' : 'Needs SEO'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(brand)}
                          className="p-2 text-brand-dark/60 hover:text-brand-gold transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(brand.id)}
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

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && currentBrand && (
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
              className="relative w-full max-w-4xl bg-brand-cream rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-2xl font-serif text-brand-dark">
                    {currentBrand.id ? 'Edit Brand' : 'Add New Brand'}
                  </h2>
                  <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold mt-1">
                    {currentBrand.id ? `ID: ${currentBrand.id}` : 'New Brand Entry'}
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
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Brand Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={currentBrand.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                        placeholder="e.g. Sana Safinaz"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Slug / URL Path *</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-brand-dark/40 font-mono">/brand/</span>
                        <input
                          type="text"
                          name="slug"
                          required
                          value={currentBrand.slug || ''}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm font-mono"
                          placeholder="sana-safinaz"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Logo</label>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 rounded-2xl bg-white border border-brand-dark/10 flex items-center justify-center overflow-hidden">
                            {currentBrand.logo ? (
                              <img 
                                src={currentBrand.logo} 
                                alt="Logo Preview" 
                                className="w-full h-full object-contain p-2"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <ImageIcon className="text-brand-dark/20" size={32} />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleLogoUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center space-x-2 px-4 py-2 bg-brand-cream border border-brand-dark/10 rounded-xl text-xs font-bold uppercase tracking-widest text-brand-dark/60 hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all"
                            >
                              <Upload size={14} />
                              <span>Upload Logo</span>
                            </button>
                            <p className="text-[10px] text-brand-dark/40 italic">PNG, JPG or SVG. Max 1MB.</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-2">Or Logo URL</label>
                          <input
                            type="url"
                            name="logo"
                            value={currentBrand.logo || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-brand-dark/5">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={currentBrand.isActive !== false}
                        onChange={(e) => setCurrentBrand(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null)}
                        className="w-5 h-5 text-brand-gold border-brand-dark/10 rounded focus:ring-brand-gold"
                      />
                      <label htmlFor="isActive" className="text-xs font-bold uppercase tracking-widest text-brand-dark/60 cursor-pointer">
                        Active Status
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={currentBrand.description || ''}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm resize-none"
                        placeholder="Describe this brand..."
                      />
                    </div>
                    <div className="p-4 bg-brand-gold/5 rounded-2xl border border-brand-gold/10 flex items-start space-x-3">
                      <Info size={18} className="text-brand-gold flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-brand-dark/60 leading-relaxed uppercase tracking-wider font-medium">
                        Brands help users find products from their favorite designers. Ensure the slug is descriptive and SEO-friendly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SEO Section */}
                <div className="bg-white p-8 rounded-[2rem] border border-brand-dark/5 space-y-6">
                  <div className="flex items-center space-x-2 text-brand-gold">
                    <Globe size={20} />
                    <h3 className="text-lg font-serif text-brand-dark">SEO Optimization</h3>
                  </div>
                  
                  {/* <SEOSettingsForm 
                    metadata={currentBrand.seo || { title: '', description: '', keywords: '', robots: 'index, follow' }}
                    onChange={(seo) => setCurrentBrand(prev => ({ ...prev, seo }))}
                    pagePath={`/brand/${currentBrand.slug}`}
                  /> */}
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
                  Save Brand
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
              <h3 className="text-2xl font-serif text-brand-dark mb-2">Delete Brand?</h3>
              <p className="text-sm text-brand-dark/60 mb-8">
                This action cannot be undone. All products associated with this brand will need to be updated.
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

export default BrandManager;
