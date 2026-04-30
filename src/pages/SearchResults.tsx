import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, X, ChevronDown, SlidersHorizontal, 
  Search as SearchIcon, Package, Star, 
  LayoutGrid, List, ArrowUpDown, ChevronLeft, ChevronRight,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { Product, FilterOptions, SearchResponse } from '../types';
import ProductCard from '../components/common/ProductCard';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions['data'] | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination state
  const currentPage = parseInt(searchParams.get('page') || '1');
  const totalPages = Math.ceil(totalProducts / 20);

  // Fetch filters on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get('/api/search/filters');
        setFilterOptions(res.data.data);
      } catch (err) {
        console.error('Failed to load filters');
      }
    };
    fetchFilters();
  }, []);

  // Fetch products when params change
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/search?${searchParams.toString()}`);
      setProducts(res.data.data);
      setTotalProducts(res.data.pagination.total);
    } catch (err) {
      console.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.set(key, value.join(','));
    } else {
      newParams.set(key, value.toString());
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    const q = searchParams.get('q');
    setSearchParams(q ? { q } : {});
  };

  const activeFiltersCount = Array.from(searchParams.keys()).filter(k => k !== 'q' && k !== 'page' && k !== 'sortBy').length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-brand-cream/30 border-b border-brand-dark/5">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-[#C9A84C] mb-3">
                <SearchIcon size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Search Results</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-dark">
                {searchParams.get('q') ? `"${searchParams.get('q')}"` : 'All Products'}
              </h1>
              <p className="text-brand-dark/40 mt-4 font-medium italic">
                Showing {products.length} of {totalProducts} curated pieces
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-white rounded-full p-1 border border-brand-dark/5 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-brand-dark text-white shadow-md' : 'text-brand-dark/40 hover:text-brand-dark'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-brand-dark text-white shadow-md' : 'text-brand-dark/40 hover:text-brand-dark'}`}
                >
                  <List size={18} />
                </button>
              </div>
              
              <select 
                value={searchParams.get('sortBy') || 'relevance'}
                onChange={(e) => updateFilters('sortBy', e.target.value)}
                className="bg-white border border-brand-dark/5 rounded-full px-6 py-2.5 text-sm font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 shadow-sm appearance-none cursor-pointer"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="newest">Sort: Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-dark">Refine Selection</h3>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={resetFilters}
                  className="text-[10px] font-bold text-[#C9A84C] hover:underline flex items-center space-x-1"
                >
                  <RotateCcw size={10} />
                  <span>RESET</span>
                </button>
              )}
            </div>

            {/* Category Tree */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/40">Categories</h4>
              <div className="space-y-2">
                {filterOptions?.categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilters('category', searchParams.get('category') === cat.id ? null : cat.id)}
                    className={`block w-full text-left py-1 text-sm transition-colors ${
                      searchParams.get('category') === cat.id ? 'text-[#C9A84C] font-bold' : 'text-brand-dark/60 hover:text-brand-dark'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/40">Brands</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                {filterOptions?.brands.map(brand => {
                  const selectedBrands = searchParams.get('brand')?.split(',') || [];
                  const isSelected = selectedBrands.includes(brand.id);
                  return (
                    <label key={brand.id} className="flex items-center space-x-3 group cursor-pointer">
                      <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                        isSelected ? 'bg-brand-dark border-brand-dark' : 'border-brand-dark/20 group-hover:border-brand-dark/40'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isSelected}
                        onChange={() => {
                          const next = isSelected ? selectedBrands.filter(id => id !== brand.id) : [...selectedBrands, brand.id];
                          updateFilters('brand', next);
                        }}
                      />
                      <span className={`text-sm ${isSelected ? 'text-brand-dark font-bold' : 'text-brand-dark/60'}`}>{brand.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/40">Price Range</h4>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Min"
                  value={searchParams.get('minPrice') || ''}
                  onChange={(e) => updateFilters('minPrice', e.target.value)}
                  className="bg-brand-cream/30 border-none rounded-xl px-4 py-2 text-sm text-brand-dark focus:ring-1 focus:ring-[#C9A84C]/40"
                />
                <input 
                  type="number" 
                  placeholder="Max"
                  value={searchParams.get('maxPrice') || ''}
                  onChange={(e) => updateFilters('maxPrice', e.target.value)}
                  className="bg-brand-cream/30 border-none rounded-xl px-4 py-2 text-sm text-brand-dark focus:ring-1 focus:ring-[#C9A84C]/40"
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/40">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {filterOptions?.sizes.map(size => {
                  const selected = searchParams.get('sizes')?.split(',') || [];
                  const isSelected = selected.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        const next = isSelected ? selected.filter(s => s !== size) : [...selected, size];
                        updateFilters('sizes', next);
                      }}
                      className={`w-10 h-10 rounded-xl border text-[10px] font-bold transition-all ${
                        isSelected ? 'bg-brand-dark border-brand-dark text-white' : 'border-brand-dark/10 text-brand-dark hover:border-brand-dark/30'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/40">Colors</h4>
              <div className="flex flex-wrap gap-3">
                {filterOptions?.colors.map(color => {
                  const selected = searchParams.get('colors')?.split(',') || [];
                  const isSelected = selected.includes(color);
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        const next = isSelected ? selected.filter(c => c !== color) : [...selected, color];
                        updateFilters('colors', next);
                      }}
                      title={color}
                      className={`w-6 h-6 rounded-full border-2 transition-all relative ${
                        isSelected ? 'border-brand-dark ring-2 ring-brand-dark/10' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                    >
                      {isSelected && <div className="absolute inset-0 flex items-center justify-center text-[8px] mix-blend-difference text-white">✓</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Booleans */}
            <div className="space-y-3 pt-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-brand-dark/60 group-hover:text-brand-dark transition-colors">In Stock Only</span>
                <input 
                  type="checkbox" 
                  checked={searchParams.get('inStock') === 'true'}
                  onChange={(e) => updateFilters('inStock', e.target.checked ? 'true' : null)}
                  className="w-4 h-4 rounded border-brand-dark/20 text-[#C9A84C] focus:ring-[#C9A84C]/20"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-brand-dark/60 group-hover:text-brand-dark transition-colors">New Arrivals</span>
                <input 
                  type="checkbox" 
                  checked={searchParams.get('isNew') === 'true'}
                  onChange={(e) => updateFilters('isNew', e.target.checked ? 'true' : null)}
                  className="w-4 h-4 rounded border-brand-dark/20 text-[#C9A84C] focus:ring-[#C9A84C]/20"
                />
              </label>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1">
            {/* Active Filter Chips */}
            <AnimatePresence>
              {activeFiltersCount > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 mb-8"
                >
                  {Array.from(searchParams.entries()).map(([key, value]) => {
                    if (key === 'q' || key === 'page' || key === 'sortBy') return null;
                    return (
                      <div key={key} className="flex items-center space-x-2 bg-brand-cream/50 px-4 py-1.5 rounded-full text-[10px] font-bold text-brand-dark/60">
                        <span className="uppercase tracking-widest text-[#C9A84C]">{key}:</span>
                        <span>{value}</span>
                        <button onClick={() => updateFilters(key, null)} className="hover:text-red-500 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4 animate-pulse">
                    <div className="aspect-[3/4] bg-brand-cream/50 rounded-3xl" />
                    <div className="space-y-2">
                      <div className="h-4 bg-brand-cream/50 rounded-full w-2/3" />
                      <div className="h-4 bg-brand-cream/50 rounded-full w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8' : 'space-y-6'}>
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-brand-cream/50 rounded-full flex items-center justify-center mb-6">
                  <Package size={40} className="text-brand-dark/20" />
                </div>
                <h2 className="text-2xl font-serif text-brand-dark mb-2">No results found</h2>
                <p className="text-brand-dark/40 max-w-md mx-auto">
                  We couldn't find any products matching your search. Try adjusting your filters or searching for something else.
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-8 px-8 py-3 bg-brand-dark text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C9A84C] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-16 pt-12 border-t border-brand-dark/5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => updateFilters('page', currentPage - 1)}
                  className="w-12 h-12 rounded-full border border-brand-dark/10 flex items-center justify-center hover:bg-brand-dark hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-dark transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center space-x-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateFilters('page', i + 1)}
                      className={`w-12 h-12 rounded-full text-sm font-bold transition-all ${
                        currentPage === i + 1 ? 'bg-brand-dark text-white shadow-lg' : 'hover:bg-brand-cream text-brand-dark/60'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => updateFilters('page', currentPage + 1)}
                  className="w-12 h-12 rounded-full border border-brand-dark/10 flex items-center justify-center hover:bg-brand-dark hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-dark transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
