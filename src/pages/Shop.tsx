import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter as FilterIcon, ChevronDown, LayoutGrid, List, Kanban, X, 
  Search, SlidersHorizontal, Check, RotateCcw, Sparkles 
} from 'lucide-react';
import { products as mockProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import Price from '../components/common/Price';
import ProductCard from '../components/common/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { productService } from '../services/api';
import axios from 'axios';
import { Filter, FilterValue } from '../types';

const Shop = () => {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [kanbanGroupBy, setKanbanGroupBy] = useState<'category' | 'parentCategory' | 'status'>('category');
  const sortBy = searchParams.get('sort') || 'newest';
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const parentCategories = useMemo(() => categories.filter(c => !c.parentId), [categories]);
  const [isLoading, setIsLoading] = useState(true);
  const [dynamicFilters, setDynamicFilters] = useState<Filter[]>([]);
  const [filterValuesMap, setFilterValuesMap] = useState<Record<string, FilterValue[]>>({});
  

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const parseJsonSafe = (field: any) => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getAll();
        const publishedData = Array.isArray(data) ? data.filter(p => !p.status || p.status.toLowerCase() === 'published') : [];
        setProducts(publishedData.length > 0 ? publishedData : mockProducts.filter(p => !p.status || p.status.toLowerCase() === 'published')); // Fallback to mock if DB empty
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts(mockProducts.filter(p => !p.status || p.status.toLowerCase() === 'published'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
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
    const fetchFilters = async () => {
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
      } catch (error) {
        console.error('Failed to fetch dynamic filters:', error);
      }
    };
    fetchFilters();
  }, []);

  const currentCategory = searchParams.get('category');
  const currentParentCategoryId = searchParams.get('parentCategoryId');
  const currentCategoryId = searchParams.get('categoryId');
  const currentBrand = searchParams.get('brand');
  const searchQuery = searchParams.get('q');
  const currentFilter = searchParams.get('filter');
  const currentGender = searchParams.get('gender');
  const currentType = searchParams.get('type');
  const currentTags = searchParams.getAll('tag');
  const currentColors = searchParams.getAll('color');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    if (Array.isArray(products)) {
      products.forEach(p => {
        const tagsList = parseJsonSafe(p.tags);
        tagsList.forEach((t: string) => tags.add(t));
      });
    }
    return Array.from(tags).sort();
  }, [products]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    if (Array.isArray(products)) {
      products.forEach(p => {
        const colorsList = parseJsonSafe(p.colors);
        colorsList.forEach((c: string) => colors.add(c));
      });
    }
    return Array.from(colors).sort();
  }, [products]);

  const allBrands = useMemo(() => {
    const brands = new Set<string>();
    if (Array.isArray(products)) {
      products.forEach(p => {
        if (p.brand) brands.add(p.brand);
      });
    }
    return Array.from(brands).sort();
  }, [products]);

  const colorMap: Record<string, string> = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Red': '#EF4444',
    'Blue': '#3B82F6',
    'Green': '#10B981',
    'Yellow': '#F59E0B',
    'Purple': '#8B5CF6',
    'Pink': '#EC4899',
    'Orange': '#F97316',
    'Gray': '#6B7280',
    'Brown': '#78350F',
    'Beige': '#F5F5DC',
    'Navy': '#1E3A8A',
    'Gold': '#D4AF37',
    'Silver': '#C0C0C0',
    'Cream': '#FFFDD0',
    'Tan': '#D2B48C',
    'Olive': '#808000',
    'Teal': '#008080',
    'Maroon': '#800000',
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (currentCategory) {
      result = result.filter(p => p.category === currentCategory || p.subcategory === currentCategory || p.categoryId === currentCategory || p.parentCategoryId === currentCategory);
    }

    if (currentParentCategoryId) {
      result = result.filter(p => p.parentCategoryId === currentParentCategoryId);
    }

    if (currentCategoryId) {
      result = result.filter(p => p.categoryId === currentCategoryId);
    }

    if (currentBrand) {
      result = result.filter(p => p.brand?.toLowerCase() === currentBrand.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }

    if (currentGender) {
      result = result.filter(p => p.gender === currentGender);
    }

    if (currentType) {
      result = result.filter(p => p.type === currentType);
    }

    if (currentFilter === 'new') {
      result = result.filter(p => p.isNew);
    }

    // Dynamic Filters
    dynamicFilters.forEach(filter => {
      const selectedValues = searchParams.getAll(filter.name);
      if (selectedValues.length > 0) {
        result = result.filter(p => {
          const productValueIds = p.dynamicFilters?.[filter.id] || [];
          const filterValues = filterValuesMap[filter.id] || [];
          const selectedValueIds = filterValues
            .filter(v => selectedValues.includes(v.value))
            .map(v => v.id);
          
          return productValueIds.some((vId: string) => selectedValueIds.includes(vId));
        });
      }
    });

    if (currentTags.length > 0) {
      result = result.filter(p => {
        const tagsList = parseJsonSafe(p.tags);
        return tagsList.some(t => currentTags.includes(t));
      });
    }

    if (currentColors.length > 0) {
      result = result.filter(p => {
        const colorsList = parseJsonSafe(p.colors);
        return colorsList.some(c => currentColors.includes(c));
      });
    }

    if (minPrice) {
      result = result.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      result = result.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'best-seller') {
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return result;
  }, [products, currentCategory, currentFilter, currentGender, currentType, currentTags, currentColors, minPrice, maxPrice, sortBy, dynamicFilters, filterValuesMap, currentBrand, searchQuery]);

  // Reset to page 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, currentFilter, currentGender, currentType, currentTags, currentColors, minPrice, maxPrice, sortBy, searchQuery, currentBrand, currentParentCategoryId, currentCategoryId]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const pageTitle = useMemo(() => {
    let title = '';
    if (currentGender) title += `${currentGender}'s `;
    
    if (currentParentCategoryId) {
      const parent = categories.find(c => c.id === currentParentCategoryId);
      if (parent) title += `${parent.name} `;
    }

    if (currentCategoryId) {
      const child = categories.find(c => c.id === currentCategoryId);
      if (child) title += `${child.name} `;
    }

    if (currentCategory && !currentParentCategoryId && !currentCategoryId) {
      const cat = categories.find(c => c.id === currentCategory);
      if (cat) title += `${cat.name} `;
      else title += `${currentCategory} `;
    }

    if (currentType && !currentCategory && !currentParentCategoryId && !currentCategoryId) title += `${currentType} `;
    if (currentBrand) title = `${currentBrand} `;
    if (searchQuery) title = `Results for "${searchQuery}"`;
    if (!title) title = 'Our Collection';
    return title;
  }, [currentGender, currentCategory, currentParentCategoryId, currentCategoryId, currentType, categories, currentBrand, searchQuery]);

  const toggleFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentValues = newParams.getAll(key);
    if (currentValues.includes(value)) {
      const filtered = currentValues.filter(v => v !== value);
      newParams.delete(key);
      filtered.forEach(v => newParams.append(key, v));
    } else {
      newParams.append(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'newest') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', value);
    }
    setSearchParams(newParams);
  };

  const handlePriceChange = (min: string, max: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set('minPrice', min);
    else newParams.delete('minPrice');
    
    if (max) newParams.set('maxPrice', max);
    else newParams.delete('maxPrice');
    
    setSearchParams(newParams);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const FilterDropdown = ({ label, id, children, isActive, onClear }: { label: string, id: string, children: React.ReactNode, isActive?: boolean, onClear?: () => void }) => (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => setActiveDropdown(activeDropdown === id ? null : id)}
        className={`flex items-center space-x-3 px-5 py-2.5 rounded-full border transition-all text-[10px] font-bold uppercase tracking-[0.15em] ${
          activeDropdown === id 
            ? 'border-brand-gold text-brand-gold bg-brand-gold/5 shadow-sm' 
            : isActive 
              ? 'border-brand-gold/30 text-brand-gold bg-brand-gold/5'
              : 'border-brand-dark/10 text-brand-dark/60 hover:border-brand-gold/40 hover:text-brand-dark'
        }`}
      >
        <span>{label}</span>
        <ChevronDown size={12} className={`transition-transform duration-500 ${activeDropdown === id ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {activeDropdown === id && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 mt-3 w-72 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-brand-dark/5 p-6 z-40"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-dark/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">{label}</span>
              {onClear && isActive && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onClear(); }}
                  className="text-[9px] font-bold uppercase tracking-widest text-brand-gold hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 space-y-6 md:space-y-0">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-4xl sm:text-6xl font-serif capitalize tracking-tight">
              {pageTitle}
            </h1>
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-1 px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full border border-brand-gold/20"
              >
                <Sparkles size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">AI Search Result</span>
              </motion.div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-dark-muted">{filteredProducts.length} Products found</p>
            {searchParams.toString() && (
              <button 
                onClick={clearAllFilters}
                className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold-dark hover:text-brand-gold transition-colors"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden lg:block relative group">
            <select 
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-white border border-brand-dark/10 rounded-full px-6 py-3 pr-12 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-gold cursor-pointer hover:border-brand-gold transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="best-seller">Best Sellers</option>
            </select>
            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-dark/40" />
          </div>
          
          <div className="hidden lg:flex items-center border border-brand-dark/10 rounded-full p-1 bg-white">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-brand-gold text-white' : 'text-brand-dark/40 hover:text-brand-gold'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'bg-brand-gold text-white' : 'text-brand-dark/40 hover:text-brand-gold'}`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-full transition-colors ${viewMode === 'kanban' ? 'bg-brand-gold text-white' : 'text-brand-dark/40 hover:text-brand-gold'}`}
              title="Kanban View"
            >
              <Kanban size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters - Basic Navigation */}
        <aside className="hidden lg:block lg:w-64 space-y-16 lg:sticky lg:top-32 lg:h-fit self-start">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] mb-8 text-brand-dark-muted border-b border-brand-dark/5 pb-2">Parent Categories</h3>
            <div className="space-y-5">
              {categories.filter(c => !c.parentId).map(parent => (
                <button 
                  key={parent.id}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    if (currentParentCategoryId === parent.id) {
                      params.delete('parentCategoryId');
                    } else {
                      params.set('parentCategoryId', parent.id);
                      params.delete('categoryId');
                    }
                    setSearchParams(params);
                  }}
                  className={`group flex items-center justify-between w-full text-xs tracking-wider transition-all capitalize ${currentParentCategoryId === parent.id ? 'text-brand-gold-dark font-bold' : 'text-brand-dark-muted hover:text-brand-dark hover:translate-x-1'}`}
                >
                  <span className="relative">
                    {parent.name}
                    {currentParentCategoryId === parent.id && (
                      <motion.span 
                        layoutId="activeParent"
                        className="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-gold rounded-full"
                      />
                    )}
                  </span>
                  {currentParentCategoryId === parent.id && <Check size={12} className="text-brand-gold-dark" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] mb-8 text-brand-dark-muted border-b border-brand-dark/5 pb-2">Child Categories</h3>
            <div className="space-y-5">
              <button 
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('categoryId');
                  setSearchParams(params);
                }}
                className={`group flex items-center justify-between w-full text-xs tracking-wider transition-all ${!currentCategoryId ? 'text-brand-gold-dark font-bold' : 'text-brand-dark-muted hover:text-brand-dark hover:translate-x-1'}`}
              >
                <span className="relative">
                  All Collections
                  {!currentCategoryId && (
                    <motion.span 
                      layoutId="activeCategory"
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-gold rounded-full"
                    />
                  )}
                </span>
                {!currentCategoryId && <Check size={12} className="text-brand-gold-dark" />}
              </button>
              {categories
                .filter(c => currentParentCategoryId ? c.parentId === currentParentCategoryId : c.parentId)
                .map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('categoryId', cat.id);
                      setSearchParams(params);
                    }}
                    className={`group flex items-center justify-between w-full text-xs tracking-wider transition-all capitalize ${currentCategoryId === cat.id ? 'text-brand-gold-dark font-bold' : 'text-brand-dark-muted hover:text-brand-dark hover:translate-x-1'}`}
                  >
                    <span className="relative">
                      {cat.name}
                      {currentCategoryId === cat.id && (
                        <motion.span 
                          layoutId="activeCategory"
                          className="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-gold rounded-full"
                        />
                      )}
                    </span>
                    {currentCategoryId === cat.id && <Check size={12} className="text-brand-gold-dark" />}
                  </button>
                ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow space-y-8">
          {/* Top Filter Bar - Sticky */}
          <div className="sticky top-14 sm:top-20 z-30 bg-brand-cream/90 backdrop-blur-xl py-4 sm:py-6 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-brand-dark/5 lg:border-none mb-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Mobile Filter & Sort Buttons */}
              <div className="flex lg:hidden items-center gap-2 w-full">
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-brand-dark text-white rounded-2xl shadow-lg shadow-brand-dark/10 active:scale-95 transition-all"
                >
                  <SlidersHorizontal size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
                  {(currentTags.length > 0 || currentColors.length > 0 || minPrice || maxPrice) && (
                    <span className="bg-brand-gold text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold">
                      {currentTags.length + currentColors.length + (minPrice || maxPrice ? 1 : 0)}
                    </span>
                  )}
                </button>
                
                <div className="relative flex-1">
                  <select 
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-brand-dark/10 rounded-2xl px-4 py-3 pr-10 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-brand-gold transition-all"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="price-low">Price: Low-High</option>
                    <option value="price-high">Price: High-Low</option>
                    <option value="rating">Rating</option>
                    <option value="best-seller">Best Sellers</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-dark/40" />
                </div>

                <div className="flex items-center border border-brand-dark/10 rounded-2xl p-1 bg-white">
                  <button 
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : viewMode === 'list' ? 'kanban' : 'grid')}
                    className="p-2 text-brand-gold"
                  >
                    {viewMode === 'grid' ? <LayoutGrid size={18} /> : viewMode === 'list' ? <List size={18} /> : <Kanban size={18} />}
                  </button>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center space-x-2 mr-2 text-brand-dark-muted">
                  <FilterIcon size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Filter By</span>
                </div>

                <FilterDropdown 
                  label="Category" 
                  id="categories" 
                  isActive={!!(currentParentCategoryId || currentCategoryId)}
                  onClear={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('parentCategoryId');
                    params.delete('categoryId');
                    setSearchParams(params);
                  }}
                >
                  <div className="space-y-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30 mb-3">Parent Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {parentCategories.map(parent => (
                          <button 
                            key={parent.id}
                            onClick={() => {
                              const params = new URLSearchParams(searchParams);
                              if (currentParentCategoryId === parent.id) {
                                params.delete('parentCategoryId');
                              } else {
                                params.set('parentCategoryId', parent.id);
                                params.delete('categoryId'); // Clear child when parent changes
                              }
                              setSearchParams(params);
                            }}
                            className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${currentParentCategoryId === parent.id ? 'bg-brand-gold text-white border-brand-gold shadow-md shadow-brand-gold/20' : 'bg-white text-brand-dark/50 border-brand-dark/10 hover:border-brand-gold/40 hover:text-brand-dark'}`}
                          >
                            {parent.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {currentParentCategoryId && (
                      <div>
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30 mb-3">Sub Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {categories.filter(c => c.parentId === currentParentCategoryId).map(cat => (
                            <button 
                              key={cat.id}
                              onClick={() => {
                                const params = new URLSearchParams(searchParams);
                                if (currentCategoryId === cat.id) {
                                  params.delete('categoryId');
                                } else {
                                  params.set('categoryId', cat.id);
                                }
                                setSearchParams(params);
                              }}
                              className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${currentCategoryId === cat.id ? 'bg-brand-gold text-white border-brand-gold shadow-md shadow-brand-gold/20' : 'bg-white text-brand-dark/50 border-brand-dark/10 hover:border-brand-gold/40 hover:text-brand-dark'}`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </FilterDropdown>

                <FilterDropdown 
                  label="Brand" 
                  id="brands" 
                  isActive={!!currentBrand}
                  onClear={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('brand');
                    setSearchParams(params);
                  }}
                >
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {allBrands.map(brand => (
                      <button 
                        key={brand}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          if (currentBrand === brand) {
                            params.delete('brand');
                          } else {
                            params.set('brand', brand);
                          }
                          setSearchParams(params);
                        }}
                        className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${currentBrand === brand ? 'bg-brand-gold text-white border-brand-gold shadow-md shadow-brand-gold/20' : 'bg-white text-brand-dark/50 border-brand-dark/10 hover:border-brand-gold/40 hover:text-brand-dark'}`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </FilterDropdown>

                <FilterDropdown 
                  label="Price Range" 
                  id="price" 
                  isActive={!!(minPrice || maxPrice)}
                  onClear={() => handlePriceChange('', '')}
                >
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30 block mb-2">Min Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40 text-xs">$</span>
                          <input 
                            type="number" 
                            value={minPrice || ''}
                            onChange={(e) => handlePriceChange(e.target.value, maxPrice || '')}
                            placeholder="0" 
                            className="w-full bg-brand-cream/20 border border-brand-dark/5 rounded-xl pl-7 pr-3 py-3 text-sm focus:outline-none focus:border-brand-gold/30 transition-all" 
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30 block mb-2">Max Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40 text-xs">$</span>
                          <input 
                            type="number" 
                            value={maxPrice || ''}
                            onChange={(e) => handlePriceChange(minPrice || '', e.target.value)}
                            placeholder="1000" 
                            className="w-full bg-brand-cream/20 border border-brand-dark/5 rounded-xl pl-7 pr-3 py-3 text-sm focus:outline-none focus:border-brand-gold/30 transition-all" 
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveDropdown(null)}
                      className="w-full bg-brand-dark text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10 hover:shadow-brand-gold/20"
                    >
                      Apply Filter
                    </button>
                  </div>
                </FilterDropdown>

                {dynamicFilters.map(filter => (
                  <FilterDropdown
                    key={filter.id}
                    label={filter.name}
                    id={filter.id}
                    isActive={searchParams.getAll(filter.name).length > 0}
                    onClear={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete(filter.name);
                      setSearchParams(params);
                    }}
                  >
                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {(filterValuesMap[filter.id] || []).map(val => (
                        <button 
                          key={val.id}
                          onClick={() => toggleFilter(filter.name, val.value)}
                          className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${searchParams.getAll(filter.name).includes(val.value) ? 'bg-brand-gold text-white border-brand-gold shadow-md shadow-brand-gold/20' : 'bg-white text-brand-dark/50 border-brand-dark/10 hover:border-brand-gold/40 hover:text-brand-dark'}`}
                        >
                          {val.value}
                        </button>
                      ))}
                    </div>
                  </FilterDropdown>
                ))}

                <FilterDropdown 
                  label="Colors" 
                  id="colors" 
                  isActive={currentColors.length > 0}
                  onClear={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('color');
                    setSearchParams(params);
                  }}
                >
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {allColors.map(color => (
                      <button 
                        key={color}
                        onClick={() => toggleFilter('color', color)}
                        className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${currentColors.includes(color) ? 'bg-brand-gold text-white border-brand-gold shadow-md shadow-brand-gold/20' : 'bg-white text-brand-dark/50 border-brand-dark/10 hover:border-brand-gold/40 hover:text-brand-dark'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </FilterDropdown>

                <FilterDropdown 
                  label="Tags" 
                  id="tags" 
                  isActive={currentTags.length > 0}
                  onClear={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('tag');
                    setSearchParams(params);
                  }}
                >
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {allTags.map(tag => (
                      <button 
                        key={tag}
                        onClick={() => toggleFilter('tag', tag)}
                        className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${currentTags.includes(tag) ? 'bg-brand-gold text-white border-brand-gold shadow-md shadow-brand-gold/20' : 'bg-white text-brand-dark/50 border-brand-dark/10 hover:border-brand-gold/40 hover:text-brand-dark'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </FilterDropdown>
              </div>

              {/* Active Filter Chips */}
              <div className="flex flex-wrap gap-2 lg:ml-auto">
                {currentBrand && (
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('brand');
                      setSearchParams(params);
                    }}
                    className="flex items-center space-x-2 bg-white border border-brand-gold/20 text-brand-gold px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all group"
                  >
                    <span>{currentBrand}</span>
                    <X size={10} className="text-brand-gold/40 group-hover:text-white" />
                  </button>
                )}
                {dynamicFilters.map(filter => 
                  searchParams.getAll(filter.name).map(val => (
                    <button 
                      key={`${filter.id}-${val}`}
                      onClick={() => toggleFilter(filter.name, val)}
                      className="flex items-center space-x-2 bg-white border border-brand-gold/20 text-brand-gold px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all group"
                    >
                      <span>{val}</span>
                      <X size={10} className="text-brand-gold/40 group-hover:text-white" />
                    </button>
                  ))
                )}
                {currentTags.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => toggleFilter('tag', tag)}
                    className="flex items-center space-x-2 bg-white border border-brand-gold/20 text-brand-gold px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all group"
                  >
                    <span>{tag}</span>
                    <X size={10} className="text-brand-gold/40 group-hover:text-white" />
                  </button>
                ))}
                {currentColors.map(color => (
                  <button 
                    key={color}
                    onClick={() => toggleFilter('color', color)}
                    className="flex items-center space-x-2 bg-white border border-brand-gold/20 text-brand-gold px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all group"
                  >
                    <span>{color}</span>
                    <X size={10} className="text-brand-gold/40 group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div>
            <AnimatePresence mode="wait">
              {viewMode === 'kanban' ? (
                <div className="space-y-8">
                  <div className="flex items-center space-x-4 bg-brand-cream/30 p-4 rounded-3xl border border-brand-dark/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 ml-2">Group By:</span>
                    <div className="flex space-x-2">
                      {(['category', 'parentCategory', 'status'] as const).map(group => (
                        <button
                          key={group}
                          onClick={() => setKanbanGroupBy(group)}
                          className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${kanbanGroupBy === group ? 'bg-brand-dark text-white shadow-lg' : 'bg-white text-brand-dark/40 hover:text-brand-dark'}`}
                        >
                          {group === 'parentCategory' ? 'Parent Category' : group}
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    key={`kanban-${kanbanGroupBy}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex space-x-6 overflow-x-auto pb-8 custom-scrollbar min-h-[600px] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                  >
                    {(() => {
                      let groups: { id: string, name: string }[] = [];
                      if (kanbanGroupBy === 'category') {
                        groups = categories.filter(c => c.parentId).map(c => ({ id: c.id, name: c.name }));
                      } else if (kanbanGroupBy === 'parentCategory') {
                        groups = parentCategories.map(c => ({ id: c.id, name: c.name }));
                      } else {
                        groups = [
                          { id: 'new', name: 'New Arrivals' },
                          { id: 'featured', name: 'Featured' },
                          { id: 'sale', name: 'On Sale' },
                          { id: 'regular', name: 'Regular Collection' }
                        ];
                      }

                      return groups.map(group => {
                        let groupProducts = [];
                        if (kanbanGroupBy === 'category') {
                          groupProducts = filteredProducts.filter(p => p.categoryId === group.id);
                        } else if (kanbanGroupBy === 'parentCategory') {
                          groupProducts = filteredProducts.filter(p => p.parentCategoryId === group.id);
                        } else {
                          if (group.id === 'new') groupProducts = filteredProducts.filter(p => p.isNew);
                          else if (group.id === 'featured') groupProducts = filteredProducts.filter(p => p.isFeatured);
                          else if (group.id === 'sale') groupProducts = filteredProducts.filter(p => (p.discount || 0) > 0);
                          else groupProducts = filteredProducts.filter(p => !p.isNew && !p.isFeatured && !((p.discount || 0) > 0));
                        }

                        if (groupProducts.length === 0 && (currentCategory || currentGender)) return null;

                        return (
                          <div key={group.id} className="flex-shrink-0 w-80 bg-brand-cream/20 rounded-[2.5rem] p-6 border border-brand-dark/5 h-fit">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-dark flex items-center">
                                <span className="w-2 h-2 bg-brand-gold rounded-full mr-2"></span>
                                {group.name}
                              </h3>
                              <span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-brand-dark/40 border border-brand-dark/5">
                                {groupProducts.length}
                              </span>
                            </div>
                            
                            <div className="space-y-6">
                              {groupProducts.map(product => (
                                <ProductCard key={product.id} product={product} viewMode="grid" />
                              ))}
                              {groupProducts.length === 0 && (
                                <div className="py-12 text-center border-2 border-dashed border-brand-dark/5 rounded-3xl">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/20">Empty</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </motion.div>
                </div>
              ) : (
                <motion.div 
                  key={currentCategory + sortBy + viewMode + currentGender + currentTags.join(',') + currentColors.join(',') + minPrice + maxPrice}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8" 
                    : "space-y-8"
                  }
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode === 'list' ? 'list' : 'grid'} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {filteredProducts.length > itemsPerPage && viewMode !== 'kanban' && (
              <div className="mt-16 flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-4 rounded-2xl border transition-all ${
                    currentPage === 1 
                      ? 'border-brand-dark/5 text-brand-dark/20 cursor-not-allowed' 
                      : 'border-brand-dark/10 text-brand-dark hover:border-brand-gold hover:text-brand-gold active:scale-95'
                  }`}
                >
                  <ChevronDown className="rotate-90" size={16} />
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current, and pages around current
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-12 h-12 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            currentPage === page
                              ? 'bg-brand-dark text-white shadow-lg shadow-brand-dark/20'
                              : 'bg-white border border-brand-dark/10 text-brand-dark/40 hover:border-brand-gold hover:text-brand-gold'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 || 
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="text-brand-dark/20 px-1">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-4 rounded-2xl border transition-all ${
                    currentPage === totalPages 
                      ? 'border-brand-dark/5 text-brand-dark/20 cursor-not-allowed' 
                      : 'border-brand-dark/10 text-brand-dark hover:border-brand-gold hover:text-brand-gold active:scale-95'
                  }`}
                >
                  <ChevronDown className="-rotate-90" size={16} />
                </button>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-brand-dark/5">
                <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center text-brand-gold mx-auto mb-6">
                  <Search size={32} />
                </div>
                <h3 className="text-3xl font-serif mb-4">No products found</h3>
                <p className="text-brand-dark/60 mb-10 max-w-md mx-auto">We couldn't find any products matching your current filters. Try adjusting them or clear all to start over.</p>
                <button 
                  onClick={clearAllFilters}
                  className="bg-brand-dark text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors shadow-lg hover:shadow-brand-gold/20"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-brand-dark/60 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 h-[85vh] w-full bg-white z-[70] shadow-2xl rounded-t-[3.5rem] flex flex-col overflow-hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-brand-dark/10 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-8 py-6 border-b border-brand-dark/5 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-serif tracking-tight">Filters</h2>
                  <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold mt-1">Refine your search</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => {
                      clearAllFilters();
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors"
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={() => setIsMobileFilterOpen(false)} 
                    className="p-3 bg-brand-cream rounded-full hover:text-brand-gold transition-all active:scale-90"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 custom-scrollbar">
                    {/* Brands */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Brands</h3>
                        {currentBrand && (
                          <button 
                            onClick={() => {
                              const params = new URLSearchParams(searchParams);
                              params.delete('brand');
                              setSearchParams(params);
                            }}
                            className="text-[9px] font-bold uppercase tracking-widest text-brand-gold"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {allBrands.map(brand => (
                          <button 
                            key={brand}
                            onClick={() => {
                              const params = new URLSearchParams(searchParams);
                              if (currentBrand === brand) params.delete('brand');
                              else params.set('brand', brand);
                              setSearchParams(params);
                            }}
                            className={`flex justify-between items-center p-5 rounded-2xl border transition-all active:scale-95 ${currentBrand === brand ? 'bg-brand-gold/5 border-brand-gold text-brand-gold' : 'bg-brand-cream/40 border-transparent text-brand-dark/60'}`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-widest">{brand}</span>
                            {currentBrand === brand && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Parent Categories */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Parent Categories</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">
                      {currentParentCategoryId ? categories.find(c => c.id === currentParentCategoryId)?.name : 'All'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete('parentCategoryId');
                        setSearchParams(params);
                      }}
                      className={`px-3 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-95 ${!currentParentCategoryId ? 'bg-brand-gold text-white border-brand-gold shadow-lg shadow-brand-gold/20' : 'bg-brand-cream/40 text-brand-dark/50 border-transparent'}`}
                    >
                      All
                    </button>
                    {categories.filter(c => !c.parentId).map(parent => (
                      <button 
                        key={parent.id}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('parentCategoryId', parent.id);
                          setSearchParams(params);
                        }}
                        className={`px-3 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-95 ${currentParentCategoryId === parent.id ? 'bg-brand-gold text-white border-brand-gold shadow-lg shadow-brand-gold/20' : 'bg-brand-cream/40 text-brand-dark/50 border-transparent'}`}
                      >
                        {parent.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Child Categories */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Child Categories</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">
                      {currentCategoryId ? categories.find(c => c.id === currentCategoryId)?.name : 'All'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete('categoryId');
                        setSearchParams(params);
                      }}
                      className={`px-3 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-95 ${!currentCategoryId ? 'bg-brand-gold text-white border-brand-gold shadow-lg shadow-brand-gold/20' : 'bg-brand-cream/40 text-brand-dark/50 border-transparent'}`}
                    >
                      All
                    </button>
                    {categories
                      .filter(c => currentParentCategoryId ? c.parentId === currentParentCategoryId : c.parentId)
                      .map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.set('categoryId', cat.id);
                            setSearchParams(params);
                          }}
                          className={`flex justify-between items-center p-5 rounded-2xl border transition-all active:scale-95 ${currentCategoryId === cat.id ? 'bg-brand-gold/5 border-brand-gold text-brand-gold' : 'bg-brand-cream/40 border-transparent text-brand-dark/60'}`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest">{cat.name}</span>
                          {currentCategoryId === cat.id && <Check size={14} />}
                        </button>
                      ))}
                  </div>
                </section>

                {/* Price Range */}
                <section>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-6">Price Range</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-dark/40 text-xs">$</span>
                      <input 
                        type="number" 
                        value={minPrice || ''}
                        onChange={(e) => handlePriceChange(e.target.value, maxPrice || '')}
                        placeholder="Min" 
                        className="w-full bg-brand-cream/40 border border-transparent rounded-2xl pl-10 pr-5 py-5 text-sm font-mono focus:outline-none focus:border-brand-gold/30" 
                      />
                    </div>
                    <div className="w-4 h-px bg-brand-dark/10" />
                    <div className="relative flex-1">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-dark/40 text-xs">$</span>
                      <input 
                        type="number" 
                        value={maxPrice || ''}
                        onChange={(e) => handlePriceChange(minPrice || '', e.target.value)}
                        placeholder="Max" 
                        className="w-full bg-brand-cream/40 border border-transparent rounded-2xl pl-10 pr-5 py-5 text-sm font-mono focus:outline-none focus:border-brand-gold/30" 
                      />
                    </div>
                  </div>
                </section>

                {/* Dynamic Filters */}
                {dynamicFilters.map(filter => (
                  <section key={filter.id}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">{filter.name}</h3>
                      {searchParams.getAll(filter.name).length > 0 && (
                        <button 
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.delete(filter.name);
                            setSearchParams(params);
                          }}
                          className="text-[9px] font-bold uppercase tracking-widest text-brand-gold"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(filterValuesMap[filter.id] || []).map(val => (
                        <button 
                          key={val.id}
                          onClick={() => toggleFilter(filter.name, val.value)}
                          className={`flex justify-between items-center p-5 rounded-2xl border transition-all active:scale-95 ${searchParams.getAll(filter.name).includes(val.value) ? 'bg-brand-gold/5 border-brand-gold text-brand-gold' : 'bg-brand-cream/40 border-transparent text-brand-dark/60'}`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest">{val.value}</span>
                          {searchParams.getAll(filter.name).includes(val.value) && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}

                {/* Colors */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Colors</h3>
                    {currentColors.length > 0 && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">{currentColors.length} Selected</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {allColors.map(color => (
                      <button 
                        key={color}
                        onClick={() => toggleFilter('color', color)}
                        className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all active:scale-95 ${currentColors.includes(color) ? 'bg-brand-gold/5 border-brand-gold text-brand-gold' : 'bg-brand-cream/40 border-transparent text-brand-dark/60'}`}
                      >
                        <div 
                          className="w-5 h-5 rounded-full border border-brand-dark/10 shadow-inner"
                          style={{ backgroundColor: colorMap[color] || '#CCCCCC' }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{color}</span>
                        {currentColors.includes(color) && <Check size={12} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Tags */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Tags</h3>
                    {currentTags.length > 0 && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">{currentTags.length} Selected</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {allTags.map(tag => (
                      <button 
                        key={tag}
                        onClick={() => toggleFilter('tag', tag)}
                        className={`px-6 py-3 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all active:scale-95 ${currentTags.includes(tag) ? 'bg-brand-gold text-white border-brand-gold shadow-lg shadow-brand-gold/20' : 'bg-brand-cream/40 text-brand-dark/50 border-transparent'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sticky Footer */}
              <div className="px-8 py-8 bg-white border-t border-brand-dark/5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-brand-dark text-white py-6 rounded-[2rem] font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-brand-gold transition-all shadow-2xl shadow-brand-dark/20 active:scale-[0.98] flex items-center justify-center space-x-3"
                >
                  <span>Show {filteredProducts.length} Results</span>
                  <RotateCcw size={14} className="opacity-40" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Floating Filter Button */}
      <AnimatePresence>
        {!isMobileFilterOpen && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="lg:hidden fixed bottom-8 right-6 z-40"
          >
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-16 h-16 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-2xl shadow-brand-dark/40 border border-white/10 active:scale-90 transition-transform"
            >
              <div className="relative">
                <SlidersHorizontal size={24} />
                {(currentTags.length > 0 || currentColors.length > 0 || minPrice || maxPrice || currentGender || currentCategory) && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-gold text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-brand-dark">
                    {currentTags.length + currentColors.length + (minPrice || maxPrice ? 1 : 0) + (currentGender ? 1 : 0) + (currentCategory ? 1 : 0)}
                  </span>
                )}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
