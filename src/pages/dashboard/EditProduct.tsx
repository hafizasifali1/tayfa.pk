import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  X, 
  Upload, 
  ChevronRight, 
  Save, 
  Eye, 
  CheckCircle2,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// import SEOSettingsForm from '../../components/admin/SEO/SEOSettingsForm';
import { SEOMetadata, Pricelist, TaxRule, Filter, FilterValue, Category } from '../../types';

interface ProductImage {
  id: string;
  url: string;
}

const COLOR_OPTIONS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Emerald', hex: '#50C878' },
  { name: 'Maroon', hex: '#800000' },
];

const SortableImage = ({ img, index, onRemove }: { img: ProductImage, index: number, onRemove: (id: string) => void, key?: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-[4/5] rounded-2xl overflow-hidden border border-brand-dark/5 group shadow-sm ${isDragging ? 'opacity-50' : ''}`}
    >
      <img src={img.url || null} alt={`Preview ${index}`} className="w-full h-full object-cover" />
      
      <div 
        {...attributes} 
        {...listeners}
        className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="text-white" size={24} />
      </div>

      <button
        type="button"
        onClick={() => onRemove(img.id)}
        className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all z-20 shadow-sm"
      >
        <X size={14} />
      </button>

      {index === 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-brand-gold text-white text-[8px] font-bold uppercase tracking-widest py-1 text-center z-10">
          Cover Image
        </div>
      )}
    </div>
  );
};

const EditProduct = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    discount: '',
    category: '',
    parentCategoryId: '',
    categoryId: '',
    gender: 'women',
    type: 'clothing',
    subcategory: 'pret',
    description: '',
    stock: '',
    sku: '',
    tags: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    status: 'published' as 'published' | 'draft' | 'archived',
    slug: '',
    pricelistId: '',
    taxRuleId: '',
    dynamicFilters: {} as Record<string, string[]>,
    seo: {
      title: '',
      description: '',
      keywords: '',
      robots: 'index, follow'
    } as SEOMetadata
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pricelists, setPricelists] = useState<Pricelist[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [dynamicFilters, setDynamicFilters] = useState<Filter[]>([]);
  const [filterValuesMap, setFilterValuesMap] = useState<Record<string, FilterValue[]>>({});
  const [imageInput, setImageInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products?sellerId=${user?.id}`);
        const product = response.data.find((p: any) => p.id === id);
        if (product) {
          setFormData({
            name: product.name || '',
            brand: product.brand || '',
            price: product.price?.toString() || '',
            discount: product.discount?.toString() || '',
            category: product.category || '',
            parentCategoryId: product.parentCategoryId || '',
            categoryId: product.categoryId || '',
            gender: product.gender || 'women',
            type: product.type || 'clothing',
            subcategory: product.subcategory || 'pret',
            description: product.description || '',
            stock: product.stock?.toString() || '',
            sku: product.sku || '',
            tags: product.tags || [],
            colors: product.colors || [],
            sizes: product.sizes || [],
            status: product.status || 'published',
            slug: product.slug || '',
            pricelistId: product.pricelistId || '',
            taxRuleId: product.taxRuleId || '',
            dynamicFilters: product.dynamicFilters || {},
            seo: product.seo || {
              title: '',
              description: '',
              keywords: '',
              robots: 'index, follow'
            },
          });
          setImages(product.images.map((url: string) => ({ id: Math.random().toString(36).substr(2, 9), url })));
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to fetch product details');
      } finally {
        setIsFetching(false);
      }
    };

    if (user?.id && id) {
      fetchProduct();
    }
  }, [id, user?.id]);

  useEffect(() => {
    const fetchPricelists = async () => {
      try {
        const response = await axios.get('/api/pricelists');
        if (Array.isArray(response.data)) {
          setPricelists(response.data);
        } else {
          console.error('Pricelists response is not an array:', response.data);
          setPricelists([]);
        }
      } catch (err) {
        console.error('Error fetching pricelists:', err);
        setPricelists([]);
      }
    };
    fetchPricelists();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories?isActive=true');
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchDynamicFilters = async () => {
      try {
        const response = await axios.get('/api/filters?isActive=true');
        if (Array.isArray(response.data)) {
          setDynamicFilters(response.data);
          const valuesPromises = response.data.map(f => axios.get(`/api/filter-values?filterId=${f.id}`));
          const valuesResponses = await Promise.all(valuesPromises);
          const newMap: Record<string, FilterValue[]> = {};
          response.data.forEach((f, idx) => {
            newMap[f.id] = valuesResponses[idx].data;
          });
          setFilterValuesMap(newMap);
        }
      } catch (err) {
        console.error('Error fetching dynamic filters:', err);
      }
    };
    fetchDynamicFilters();
  }, []);

  useEffect(() => {
    const fetchTaxRules = async () => {
      if (!formData.pricelistId) {
        setTaxRules([]);
        return;
      }
      try {
        const response = await axios.get(`/api/tax-rules?pricelistId=${formData.pricelistId}`);
        if (Array.isArray(response.data)) {
          setTaxRules(response.data.filter((rule: TaxRule) => rule.isActive));
        } else {
          console.error('Tax rules response is not an array:', response.data);
          setTaxRules([]);
        }
      } catch (err) {
        console.error('Error fetching tax rules:', err);
        setTaxRules([]);
      }
    };
    fetchTaxRules();
  }, [formData.pricelistId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from name if slug is empty or was auto-generated
      if (name === 'name' && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))) {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return newData;
    });
  };

  const handleAddImage = () => {
    if (imageInput && !images.find(img => img.url === imageInput)) {
      if (images.length < 8) {
        setImages([...images, { id: Math.random().toString(36).substr(2, 9), url: imageInput }]);
        setImageInput('');
      } else {
        setError('Maximum 8 images allowed.');
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = 8 - images.length;
    const filesToProcess = acceptedFiles.slice(0, remainingSlots);

    if (acceptedFiles.length > remainingSlots) {
      setError(`Only ${remainingSlots} more images can be added.`);
    }

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setImages(prev => {
          if (prev.length >= 8) return prev;
          return [...prev, { id: Math.random().toString(36).substr(2, 9), url: base64 }];
        });
      };
      reader.readAsDataURL(file);
    });
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 8 - images.length,
    disabled: images.length >= 8,
    multiple: true
  } as any);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleColor = (colorName: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorName)
        ? prev.colors.filter(c => c !== colorName)
        : [...prev.colors, colorName],
    }));
  };

  const toggleDynamicFilterValue = (filterId: string, valueId: string, type: string) => {
    setFormData(prev => {
      const currentValues = prev.dynamicFilters[filterId] || [];
      let newValues: string[];

      if (type === 'dropdown') {
        newValues = [valueId];
      } else {
        newValues = currentValues.includes(valueId)
          ? currentValues.filter(v => v !== valueId)
          : [...currentValues, valueId];
      }

      return {
        ...prev,
        dynamicFilters: {
          ...prev.dynamicFilters,
          [filterId]: newValues
        }
      };
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, '');
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      const newTags = [...formData.tags];
      newTags.pop();
      setFormData(prev => ({ ...prev, tags: newTags }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (overrideStatus?: 'draft' | 'published' | 'archived') => {
    setError('');
    const status = overrideStatus || formData.status;
    
    if (status === 'published') {
      if (!formData.name || !formData.price || images.length === 0) {
        setError('Please fill in all required fields (Name, Price, and at least one Image) to publish.');
        return;
      }
    } else {
      if (!formData.name) {
        setError('Please enter at least a product name to save.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const updatedProduct = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        stock: parseInt(formData.stock) || 0,
        images: images.map(img => img.url),
        dynamicFilters: formData.dynamicFilters,
        status,
      };

      await axios.put(`/api/products/${id}`, updatedProduct);
      
      setSuccess(true);
      setTimeout(() => navigate('/seller/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeOptions = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unstitched'],
    footwear: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    accessories: ['One Size'],
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-brand-dark/40 mb-8">
          <span>Inventory</span>
          <ChevronRight size={14} />
          <span className="text-brand-gold">Edit Product</span>
        </div>

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-green-50 border border-green-200 text-green-600 p-6 rounded-[2rem] flex items-center space-x-4"
          >
            <CheckCircle2 size={32} />
            <div>
              <h3 className="font-bold text-lg">Success!</h3>
              <p className="text-sm opacity-80">Your product has been updated successfully. Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-red-50 border border-red-200 text-red-600 p-6 rounded-[2rem] flex items-center space-x-4"
          >
            <AlertCircle size={32} />
            <div>
              <h3 className="font-bold text-lg">Oops! Something went wrong</h3>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm space-y-6">
              <h3 className="text-xl font-serif text-brand-dark border-b border-brand-dark/5 pb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                    placeholder="e.g. Embroidered Silk Suit"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Brand Name</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                      placeholder="e.g. Maria B"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">SKU (Optional)</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                      placeholder="e.g. LUX-001"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Product Description *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                    placeholder="Describe your product in detail..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm space-y-6">
              <h3 className="text-xl font-serif text-brand-dark border-b border-brand-dark/5 pb-4">Pricing & Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Base Price (USD) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Discount Price (USD)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm space-y-6">
              <h3 className="text-xl font-serif text-brand-dark border-b border-brand-dark/5 pb-4">Product Images</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    className="flex-1 px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                    placeholder="Paste image URL here..."
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={!imageInput || images.length >= 8}
                    className="px-6 py-3 bg-brand-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-dark/90 transition-all disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    isDragActive ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-dark/10 hover:border-brand-gold/40'
                  } ${images.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input {...getInputProps()} />
                  <Upload size={32} className="mx-auto mb-3 text-brand-dark/20" />
                  <p className="text-sm text-brand-dark/60">
                    {isDragActive ? 'Drop images here' : 'Drag & drop multiple images or click to browse'}
                  </p>
                </div>

                <div className="bg-brand-cream/30 p-4 rounded-2xl border border-brand-gold/10">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-2">Image Guidelines</h5>
                  <ul className="text-[10px] text-brand-dark/60 space-y-1 list-disc pl-4">
                    <li>Recommended Aspect Ratio: <span className="font-bold text-brand-dark">4:5 (Portrait)</span></li>
                    <li>Recommended Dimensions: <span className="font-bold text-brand-dark">1000 x 1250 px</span></li>
                    <li>Maximum file size: <span className="font-bold text-brand-dark">2MB per image</span></li>
                    <li>Use high-quality, clear images with neutral backgrounds</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={images.map(img => img.id)}
                      strategy={rectSortingStrategy}
                    >
                      {images.map((img, idx) => (
                        <SortableImage 
                          key={img.id} 
                          img={img} 
                          index={idx} 
                          onRemove={removeImage} 
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* SEO Settings */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm space-y-6">
              <h3 className="text-xl font-serif text-brand-dark border-b border-brand-dark/5 pb-4">Search Engine Optimization (SEO)</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Product Slug / URL *</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-brand-dark/40 font-mono">/product/</span>
                    <input
                      type="text"
                      name="slug"
                      required
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm font-mono"
                      placeholder="e.g. embroidered-silk-suit"
                    />
                  </div>
                  <p className="mt-1 text-[8px] text-brand-dark/40 uppercase tracking-widest">The unique URL path for this product.</p>
                </div>

                {/* <SEOSettingsForm 
                  metadata={formData.seo} 
                  onChange={(seo) => setFormData(prev => ({ ...prev, seo }))}
                  pagePath={`/product/${formData.slug}`}
                /> */}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm space-y-6">
              <h3 className="text-xl font-serif text-brand-dark border-b border-brand-dark/5 pb-4">Organization</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Parent Category</label>
                  <select
                    name="parentCategoryId"
                    value={formData.parentCategoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                  >
                    <option value="">Select Parent Category (Optional)</option>
                    {categories
                      .filter(c => !c.parentId)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Child Category *</label>
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                  >
                    <option value="">Select Child Category</option>
                    {categories
                      .filter(c => formData.parentCategoryId ? c.parentId === formData.parentCategoryId : c.parentId)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Pricelist *</label>
                  <select
                    name="pricelistId"
                    required
                    value={formData.pricelistId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm"
                  >
                    <option value="">Select a Pricelist</option>
                    {Array.isArray(pricelists) && pricelists.map(pl => (
                      <option key={pl.id} value={pl.id}>{pl.name} ({pl.currency})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Tax Rule</label>
                  <select
                    name="taxRuleId"
                    value={formData.taxRuleId}
                    onChange={handleInputChange}
                    disabled={!formData.pricelistId}
                    className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm disabled:opacity-50"
                  >
                    <option value="">No Tax / Select Tax Rule</option>
                    {Array.isArray(taxRules) && taxRules.map(rule => (
                      <option key={rule.id} value={rule.id}>{rule.name} ({rule.rate}%) - {rule.country}</option>
                    ))}
                  </select>
                  {!formData.pricelistId && (
                    <p className="mt-1 text-[8px] text-brand-dark/40 uppercase tracking-widest">Please select a pricelist first to see available tax rules.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {(sizeOptions[formData.type as keyof typeof sizeOptions] || []).map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          formData.sizes.includes(size)
                            ? 'bg-brand-gold text-white border-brand-gold'
                            : 'bg-white text-brand-dark/40 border-brand-dark/10 hover:border-brand-gold'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Filters */}
                {dynamicFilters.length > 0 && (
                  <div className="pt-6 border-t border-brand-dark/5 space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Marketplace Filters</h4>
                    {dynamicFilters.map(filter => (
                      <div key={filter.id} className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60">{filter.name}</label>
                        <div className="flex flex-wrap gap-2">
                          {(filterValuesMap[filter.id] || []).map(val => (
                            <button
                              key={val.id}
                              type="button"
                              onClick={() => toggleDynamicFilterValue(filter.id, val.id, filter.type)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                                (formData.dynamicFilters[filter.id] || []).includes(val.id)
                                  ? 'bg-brand-gold text-white border-brand-gold'
                                  : 'bg-white text-brand-dark/40 border-brand-dark/10 hover:border-brand-gold'
                              }`}
                            >
                              {val.value}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 shadow-sm space-y-6">
              <h3 className="text-xl font-serif text-brand-dark border-b border-brand-dark/5 pb-4">Product Status</h3>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark/60 mb-2">Visibility Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl focus:ring-brand-gold focus:border-brand-gold text-sm capitalize"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="space-y-4 pt-4 border-t border-brand-dark/5">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSubmit()}
                  className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-brand-dark text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-brand-dark/90 transition-all disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{isLoading ? 'Saving...' : 'Update Product'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default EditProduct;
