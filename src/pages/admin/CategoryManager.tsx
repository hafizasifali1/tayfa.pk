import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Image as ImageIcon, 
  ChevronRight, Save, X, Globe, Info, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { Category, SEOMetadata } from '../../types';
// import SEOSettingsForm from '../../components/admin/SEO/SEOSettingsForm';

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error('Categories response is not an array:', response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory({ ...category });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentCategory({
      name: '',
      slug: '',
      image: '',
      icon: '',
      description: '',
      parentId: '',
      displayOrder: 0,
      isActive: true,
      isFeatured: false,
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
    if (!currentCategory?.name || !currentCategory?.slug) return;

    try {
      if (currentCategory.id) {
        await axios.patch(`/api/categories/${currentCategory.id}`, currentCategory);
      } else {
        await axios.post('/api/categories', currentCategory);
      }
      setIsEditing(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      setShowDeleteConfirm(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const filteredCategories = Array.isArray(categories) ? categories.filter(cat => {
    try {
      const name = cat?.name || '';
      const slug = cat?.slug || '';
      const query = searchQuery.toLowerCase();
      return name.toLowerCase().includes(query) || slug.toLowerCase().includes(query);
    } catch (err) {
      console.error('Error filtering category:', err, cat);
      return false;
    }
  }) : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setCurrentCategory(prev => {
      if (!prev) return null;
      const newData = { ...prev, [name]: val };
      
      // Auto-generate slug if name changes and slug is empty or matches previous name slug
      if (name === 'name' && (!prev.slug || prev.slug === prev.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))) {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      
      return newData;
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-brand-dark">Category Management</h1>
          <p className="text-brand-dark/60">Organize your products and optimize their search visibility.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg"
        >
          <Plus size={18} />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-dark/5">
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
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
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Image/Icon</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Category Name</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Parent</th>
                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 px-4">Order</th>
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
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-dark/40 italic">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="group hover:bg-brand-cream/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-cream flex items-center justify-center overflow-hidden border border-brand-dark/5">
                        {category.image || category.icon ? (
                          <img src={category.image || category.icon} alt={category.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <ImageIcon className="text-brand-dark/20" size={20} />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {category.parentId && <ChevronRight size={14} className="text-brand-dark/20" />}
                        <p className="font-bold text-brand-dark">{category.name}</p>
                      </div>
                      <code className="text-[10px] text-brand-dark/40">/{category.slug}</code>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                        {category.parentId ? categories.find(c => c.id === category.parentId)?.name || 'Unknown' : 'None (Parent)'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] font-bold text-brand-dark/60">{category.displayOrder || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${category.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {category.isFeatured && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-brand-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Featured</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(category)}
                          className="p-2 text-brand-dark/60 hover:text-brand-gold transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(category.id)}
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
        {isEditing && currentCategory && (
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
                    {currentCategory.id ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold mt-1">
                    {currentCategory.id ? `ID: ${currentCategory.id}` : 'New Category Entry'}
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
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Category Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={currentCategory.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                        placeholder="e.g. Pret Wear"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Slug / URL Path *</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-brand-dark/40 font-mono">/category/</span>
                        <input
                          type="text"
                          name="slug"
                          required
                          value={currentCategory.slug || ''}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm font-mono"
                          placeholder="pret-wear"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={currentCategory.image || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Parent Category</label>
                      <select
                        name="parentId"
                        value={currentCategory.parentId || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm bg-white"
                      >
                        <option value="">None (Top Level)</option>
                        {categories
                          .filter(c => c.id !== currentCategory.id && !c.parentId) // Only top level categories as parents
                          .map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))
                        }
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Display Order</label>
                      <input
                        type="number"
                        name="displayOrder"
                        value={currentCategory.displayOrder || 0}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center space-x-8 pt-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={currentCategory.isActive !== false}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-brand-dark/10 text-brand-gold focus:ring-brand-gold/20"
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Active</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={currentCategory.isFeatured === true}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-brand-dark/10 text-brand-gold focus:ring-brand-gold/20"
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Featured</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={currentCategory.description || ''}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm resize-none"
                        placeholder="Describe this category..."
                      />
                    </div>
                    <div className="p-4 bg-brand-gold/5 rounded-2xl border border-brand-gold/10 flex items-start space-x-3">
                      <Info size={18} className="text-brand-gold flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-brand-dark/60 leading-relaxed uppercase tracking-wider font-medium">
                        Categories help users find products easily. Ensure the slug is descriptive and SEO-friendly.
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
                    metadata={currentCategory.seo || { title: '', description: '', keywords: '', robots: 'index, follow' }}
                    onChange={(seo) => setCurrentCategory(prev => ({ ...prev, seo }))}
                    pagePath={`/category/${currentCategory.slug}`}
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
                  Save Category
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
              <h3 className="text-2xl font-serif text-brand-dark mb-2">Delete Category?</h3>
              <p className="text-sm text-brand-dark/60 mb-8">
                This action cannot be undone. All products in this category will need to be reassigned.
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

export default CategoryManager;
