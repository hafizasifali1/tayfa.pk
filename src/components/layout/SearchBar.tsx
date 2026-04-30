import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, X, TrendingUp, History, ShoppingBag, 
  ChevronRight, ArrowRight, Loader2, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { SuggestionData, Product, Category } from '../../types';
import { debounce } from 'lodash';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionData['data'] | null>(null);
  const [trending, setTrending] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));

    const fetchTrending = async () => {
      try {
        const res = await axios.get('/api/search/trending');
        setTrending(res.data.data);
      } catch (err) {
        console.error('Failed to fetch trending searches');
      }
    };
    fetchTrending();
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const fetchSuggestions = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) {
        setSuggestions(null);
        setIsLoading(false);
        return;
      }
      try {
        const res = await axios.get(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
        setSuggestions(res.data.data);
      } catch (err) {
        console.error('Suggestion fetch error', err);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true);
      fetchSuggestions(query);
    } else {
      setSuggestions(null);
      setIsLoading(false);
    }
  }, [query, fetchSuggestions]);

  const handleSearch = (searchTerm: string = query) => {
    if (!searchTerm.trim()) return;
    
    // Save to recent
    const updatedRecent = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemsCount = (suggestions?.products.length || 0) + (suggestions?.categories.length || 0);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < itemsCount - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex === -1) {
        handleSearch();
      } else {
        // Handle selection of suggestion
        const products = suggestions?.products || [];
        const categories = suggestions?.categories || [];
        if (selectedIndex < products.length) {
          navigate(`/product/${products[selectedIndex].slug}`);
        } else {
          const catIndex = selectedIndex - products.length;
          navigate(`/search?category=${categories[catIndex].id}`);
        }
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={i} className="text-[#C9A84C] font-bold">{part}</span> 
        : part
    );
  };

  return (
    <div className="relative flex-1 max-w-xl mx-4" ref={searchRef}>
      {/* Search Input Box */}
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for items, brands, and more..."
          className="w-full bg-brand-cream/40 border border-[#C9A84C]/20 rounded-full py-2.5 pl-12 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:bg-white transition-all placeholder:text-brand-dark/30"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40 group-focus-within:text-[#C9A84C] transition-colors">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/20 hover:text-brand-dark transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-brand-dark/5 overflow-hidden z-[60]"
          >
            <div className="max-h-[80vh] overflow-y-auto no-scrollbar">
              {/* Initial View: Recent & Trending */}
              {!query && (
                <div className="p-6 space-y-8">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 text-brand-dark/40 mb-4">
                        <History size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Recent Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearch(s)}
                            className="px-4 py-2 bg-brand-cream/50 hover:bg-[#C9A84C]/10 text-brand-dark text-xs rounded-full transition-colors flex items-center space-x-2 group"
                          >
                            <span>{s}</span>
                            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-2 text-brand-dark/40 mb-4">
                      <TrendingUp size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Trending Now</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {trending.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(t)}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-brand-cream/40 transition-colors text-sm text-brand-dark group"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-[#C9A84C] font-serif italic">{i + 1}</span>
                            <span>{t}</span>
                          </div>
                          <ChevronRight size={14} className="text-brand-dark/10 group-hover:text-brand-dark/40" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions View */}
              {query && (
                <div className="p-2">
                  {isLoading && !suggestions && (
                    <div className="p-12 text-center text-brand-dark/40">
                      <Loader2 size={24} className="animate-spin mx-auto mb-3" />
                      <p className="text-xs uppercase tracking-widest font-medium">Searching TAYFA...</p>
                    </div>
                  )}

                  {suggestions && (
                    <div className="space-y-4 py-2">
                      {/* Categories Section */}
                      {suggestions.categories.length > 0 && (
                        <div className="px-4">
                          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-3 ml-2">Categories</div>
                          <div className="space-y-1">
                            {suggestions.categories.map((cat, i) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  navigate(`/search?category=${cat.id}`);
                                  setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                                  selectedIndex === (suggestions.products.length + i) ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'hover:bg-brand-cream/40 text-brand-dark'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-lg bg-brand-cream flex items-center justify-center">
                                    <Sparkles size={14} className="text-[#C9A84C]" />
                                  </div>
                                  <span className="text-sm font-medium">{highlightText(cat.name, query)}</span>
                                </div>
                                <ArrowRight size={14} className="opacity-40" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Products Section */}
                      {suggestions.products.length > 0 && (
                        <div className="px-4">
                          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 mb-3 ml-2">Products</div>
                          <div className="space-y-1">
                            {suggestions.products.map((prod, i) => {
                              const images = typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images;
                              return (
                                <button
                                  key={prod.id}
                                  onClick={() => {
                                    navigate(`/product/${prod.slug}`);
                                    setIsOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left ${
                                    selectedIndex === i ? 'bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20' : 'hover:bg-brand-cream/40'
                                  }`}
                                >
                                  <div className="w-12 h-16 rounded-lg bg-brand-cream overflow-hidden flex-shrink-0">
                                    <img 
                                      src={images?.[0] || 'https://via.placeholder.com/150'} 
                                      alt={prod.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-brand-dark truncate">{highlightText(prod.name, query)}</h4>
                                    <p className="text-xs text-[#C9A84C] font-serif mt-0.5">PKR {prod.price.toLocaleString()}</p>
                                  </div>
                                  <ShoppingBag size={14} className="text-brand-dark/20" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {suggestions.products.length === 0 && suggestions.categories.length === 0 && !isLoading && (
                        <div className="p-12 text-center text-brand-dark/30">
                          <p className="text-sm">No results found for "{query}"</p>
                        </div>
                      )}

                      {/* View All Results Button */}
                      {(suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                        <div className="px-4 pb-2">
                          <button
                            onClick={() => handleSearch()}
                            className="w-full py-4 bg-brand-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#C9A84C] transition-colors flex items-center justify-center space-x-2"
                          >
                            <span>View all results for "{query}"</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
