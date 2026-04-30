import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Search, Menu, X, User, ChevronDown, ChevronRight, Sparkles, Shirt, Watch, Footprints, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';
import CountrySelector from '../common/CountrySelector';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthModal } from '../../context/AuthModalContext';
import SearchBar from './SearchBar';

interface CategoryNode {
  id: string;
  name: string;
  parentId?: string | null;
  children: CategoryNode[];
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryNode | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { wishlist } = useWishlist();
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { openModal } = useAuthModal();
  const { user, logout } = useAuth();

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

  const tree: CategoryNode[] = useMemo(() => {
    const normalize = (v: any): string | null => (v === null || v === undefined || v === '' ? null : v);
    const byParent = new Map<string | null, any[]>();
    categories.forEach(c => {
      const key = normalize(c.parentId);
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(c);
    });
    const build = (parentId: string | null): CategoryNode[] =>
      (byParent.get(parentId) ?? [])
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map(c => ({ id: c.id, name: c.name, parentId: normalize(c.parentId), children: build(c.id) }));
    return build(null);
  }, [categories]);

  useEffect(() => {
    setIsMenuOpen(false);
    setHoveredCategory(null);
  }, [location]);

  const handleMouseEnter = (category: CategoryNode) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredCategory(category);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  const handleCartEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCartOpen(true);
  };

  const handleCartLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCartOpen(false);
    }, 200);
  };

  const freeShippingThreshold = 500;
  const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);

  return (
    <nav className="sticky top-0 z-50 bg-white" onMouseLeave={handleMouseLeave}>
      {/* Announcement Bar */}
      <div className="bg-[#C9A84C] text-white py-2 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-center overflow-hidden whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          Free Worldwide Shipping on Orders Over 500 • Authentic Designer Wear • 24/7 Premium Support • 
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex justify-between items-center h-16 border-b border-[#C9A84C]/20">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 -ml-2 text-brand-dark hover:text-[#C9A84C] transition-colors"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link to="/" className="flex items-center">
              <img src="/Tayfa.png" alt="TAYFA" className="h-11 w-auto object-contain hover:opacity-80 transition-opacity" />
            </Link>
            </div>

            {/* Nav Links Shifted to Left */}
            <div className="hidden lg:flex items-center space-x-10 ml-4">
              <Link
                to="/shop?filter=new"
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-dark hover:text-[#C9A84C] transition-colors flex items-center"
              >
                <Sparkles size={12} className="mr-2 text-[#C9A84C]" />
                New Arrivals
              </Link>
              <Link
                to="/blogs"
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-dark hover:text-[#C9A84C] transition-colors"
              >
                Journal
              </Link>
            </div>
          </div>



          {/* Right: Icons */}
          <div className="flex items-center justify-end">
            <div className="hidden lg:flex items-center space-x-4 mr-6">
              {user ? (
                <>
                  {user.role === 'seller' && (
                    <Link 
                      to="/seller/dashboard" 
                      className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C9A84C] hover:text-[#C9A84C]/80 transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <button
                  onClick={() => openModal('seller')}
                  className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-dark hover:text-[#C9A84C] transition-colors"
                >
                  Sell on TAYFA
                </button>
              )}
            </div>

            <div className="flex-1 flex items-center justify-end px-4">
              <SearchBar />
            </div>

            <div className="flex items-center space-x-5">
              
              <Link to="/wishlist" className="w-[42px] h-[42px] rounded-full border border-[#C9A84C] bg-transparent flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white transition-all duration-300 relative shadow-sm group">
                <Heart size={20} strokeWidth={1.5} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C9A84C] text-white text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-md group-hover:bg-white group-hover:text-[#C9A84C] transition-colors">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <div className="hidden sm:block">
                {user ? (
                  <Link to="/account" className="w-[42px] h-[42px] rounded-full border border-[#C9A84C] bg-transparent flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white transition-all duration-300 shadow-sm">
                    <User size={20} strokeWidth={1.5} />
                  </Link>
                ) : (
                  <button 
                    onClick={() => openModal('signin')}
                    className="w-[42px] h-[42px] rounded-full border border-[#C9A84C] bg-transparent flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <User size={20} strokeWidth={1.5} />
                  </button>
                )}
              </div>

              <div 
                className="relative"
                onMouseEnter={handleCartEnter}
                onMouseLeave={handleCartLeave}
              >
                <Link to="/cart" className="w-[42px] h-[42px] rounded-full border border-[#C9A84C] bg-transparent flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white transition-all duration-300 relative group shadow-sm">
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#C9A84C] text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm group-hover:bg-white group-hover:text-[#C9A84C] transition-colors">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Cart Hover Dropdown */}
                <AnimatePresence>
                  {isCartOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-4 w-[420px] bg-white rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-brand-dark/5 z-[60] overflow-hidden"
                    >
                      {/* Header */}
                      <div className="p-5 border-b border-brand-dark/5 flex justify-between items-center bg-white">
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-dark">
                          Your Bag · {cartCount}
                        </span>
                        <span className={`text-[10px] font-medium ${cartTotal >= 500 ? 'text-[#C9A84C]' : 'text-brand-dark/40'}`}>
                          {cartTotal >= 500 ? 'Free shipping unlocked' : `Spend $${Math.max(0, 500 - cartTotal).toFixed(0)} more for free shipping`}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="px-5 py-4 bg-brand-cream/30">
                        <div className="h-1 w-full bg-brand-dark/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-[#C9A84C]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2 text-[9px] font-bold uppercase tracking-widest">
                          <span className="text-brand-dark/40">$0</span>
                          <span className={cartTotal >= 500 ? 'text-[#C9A84C]' : 'text-brand-dark/40'}>
                            $500 · UNLOCKED
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="max-h-[380px] overflow-y-auto no-scrollbar py-2">
                        {cart.length > 0 ? (
                          cart.map((item) => (
                            <div key={`${item.id}-${item.variantId}`} className="px-5 py-4 flex gap-4 hover:bg-brand-cream/20 transition-colors">
                              <div className="w-16 h-16 bg-brand-cream-dark rounded-lg overflow-hidden flex-shrink-0">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="text-sm font-bold text-brand-dark truncate pr-4">{item.name}</h4>
                                  <span className="text-sm font-bold text-brand-dark">${item.price}</span>
                                </div>
                                <p className="text-[11px] text-brand-dark/40 mb-3 truncate">
                                  {Object.values(item.attributes || {}).join(' · ') || 'No variants'}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center border border-brand-dark/10 rounded-full h-8 px-1">
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.variantId, item.qty - 1, item.cartItemId)}
                                      className="w-6 h-6 flex items-center justify-center text-brand-dark/60 hover:text-brand-dark"
                                    >
                                      −
                                    </button>
                                    <span className="w-6 text-center text-[11px] font-bold">{item.qty}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.variantId, item.qty + 1, item.cartItemId)}
                                      className="w-6 h-6 flex items-center justify-center text-brand-dark/60 hover:text-brand-dark"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button 
                                    onClick={() => removeFromCart(item.id, item.variantId, item.cartItemId)}
                                    className="text-[10px] text-brand-dark/30 hover:text-red-500 uppercase font-bold tracking-widest"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center">
                            <ShoppingBag size={40} className="mx-auto text-brand-dark/5 mb-3" />
                            <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold">Your bag is empty</p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {cart.length > 0 && (
                        <div className="p-5 bg-white border-t border-brand-dark/5 space-y-4">
                          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-[0.1em] text-brand-dark">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex gap-3">
                            <Link 
                              to="/cart"
                              className="flex-1 h-12 flex items-center justify-center border border-brand-dark/10 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark hover:bg-brand-cream-dark transition-all rounded-lg"
                            >
                              View Bag
                            </Link>
                            <Link 
                              to="/checkout"
                              className="flex-1 h-12 flex items-center justify-center bg-[#C9A84C] text-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#b89740] transition-all rounded-lg shadow-lg shadow-[#C9A84C]/20"
                            >
                              Checkout →
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Category Row */}
        <div className="hidden lg:flex items-center justify-center h-12 relative">
          <div className="flex items-center space-x-12 h-full overflow-x-auto no-scrollbar scroll-smooth px-4">
            {tree.map(category => (
              <div
                key={category.id}
                className="h-full relative group"
                onMouseEnter={() => handleMouseEnter(category)}
              >
                <Link
                  to={`/shop?categoryId=${category.id}`}
                  className={`flex items-center h-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
                    hoveredCategory?.id === category.id ? 'text-[#C9A84C]' : 'text-brand-dark/70 hover:text-brand-dark'
                  }`}
                >
                  {category.name}
                  {category.children.length > 0 && <ChevronDown size={10} className="ml-1 opacity-50" />}
                </Link>
                {/* Underline */}
                <div className="absolute bottom-2 left-0 right-0 h-0.5 overflow-hidden">
                  <motion.div
                    className="w-full h-full bg-[#C9A84C]"
                    initial={false}
                    animate={{ scaleX: hoveredCategory?.id === category.id ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {hoveredCategory && hoveredCategory.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 w-full bg-white border-b border-brand-dark/5 shadow-2xl z-40"
            onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-8 pt-4 pb-8">
              <div className="grid grid-cols-5 gap-5">
                {hoveredCategory.children.map(child => (
                  <div key={child.id} className="space-y-6">
                    <Link
                      to={`/shop?categoryId=${child.id}`}
                      className="text-[15px] font-bold tracking-[0.05em] uppercase text-brand-dark hover:text-[#C9A84C] transition-colors inline-block"
                    >
                      {child.name}
                    </Link>
                    {child.children.length > 0 && (
                      <ul className="space-y-3">
                        {child.children.map(sub => (
                          <li key={sub.id}>
                              <Link
                                to={`/shop?categoryId=${sub.id}`}
                                className="text-[12.5px] text-brand-dark/60 hover:text-[#C9A84C] transition-colors py-1 block font-medium tracking-normal"
                              >
                                {sub.name}
                              </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                
                {/* Promotional/Editorial Column */}
                <div className="col-span-1 border-l border-brand-dark/5 pl-12 flex flex-col justify-center">
                  <div className="aspect-[3/4] bg-brand-cream-dark relative overflow-hidden rounded-sm group">
                    <img 
                      src={`https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800`} 
                      alt="Editorial" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] mb-2">Editorial</p>
                      <h4 className="text-xl font-serif leading-tight">The {hoveredCategory.name} Edit</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto"
          >
            <div className="px-6 py-10 space-y-8">
              <div className="space-y-4">
                {tree.map(parent => (
                  <div key={parent.id} className="border-b border-brand-dark/5 pb-4">
                    <button
                      onClick={() => setMobileExpandedParent(mobileExpandedParent === parent.id ? null : parent.id)}
                      className="w-full flex justify-between items-center py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-dark"
                    >
                      <span>{parent.name}</span>
                      {parent.children.length > 0 && (
                        <ChevronDown size={14} className={`transition-transform duration-300 ${mobileExpandedParent === parent.id ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    <AnimatePresence>
                      {mobileExpandedParent === parent.id && parent.children.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 space-y-4 pl-4"
                        >
                          {parent.children.map(child => (
                            <div key={child.id} className="space-y-2">
                              <Link
                                to={`/shop?categoryId=${child.id}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60"
                              >
                                {child.name}
                              </Link>
                              {child.children.length > 0 && (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                                  {child.children.map(sub => (
                                    <Link
                                      key={sub.id}
                                      to={`/shop?categoryId=${sub.id}`}
                                      onClick={() => setIsMenuOpen(false)}
                                      className="text-xs text-brand-dark/40 py-1"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-6">
                <Link
                  to="/shop?filter=new"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center text-xs font-bold uppercase tracking-[0.2em] text-[#C9A84C]"
                >
                  <Sparkles size={16} className="mr-3" />
                  New Arrivals
                </Link>
                <Link
                  to="/blogs"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-dark"
                >
                  Journal
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center text-xs font-bold uppercase tracking-[0.2em] text-brand-dark"
                >
                  <Heart size={16} className="mr-3" />
                  Wishlist
                </Link>
              </div>

              <div className="pt-10">
                {user ? (
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] border border-brand-dark/10 rounded-sm"
                  >
                    Logout
                  </button>
                ) : (
                  <button 
                    onClick={() => { openModal('signin'); setIsMenuOpen(false); }}
                    className="w-full py-4 bg-brand-dark text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
