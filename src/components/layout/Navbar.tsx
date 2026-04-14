import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Search, Menu, X, User, ChevronDown, ChevronRight, Sparkles, Shirt, Watch, Footprints, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';
import CountrySelector from '../common/CountrySelector';
import { motion, AnimatePresence } from 'motion/react';

interface SubCategory {
  name: string;
  path: string;
  items?: { name: string; path: string }[];
  icon?: React.ElementType;
}

interface NavItem {
  name: string;
  path: string;
  featured?: boolean;
  subCategories?: SubCategory[];
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const navItems: NavItem[] = [
    { 
      name: 'New Arrivals', 
      path: '/shop?filter=new', 
      featured: true,
      subCategories: [
        { name: 'Latest Trends', path: '/shop?filter=new' },
        { name: 'Best Sellers', path: '/shop?filter=popular' },
        { name: 'Limited Edition', path: '/shop?filter=limited' },
      ]
    },
    ...categories
      .filter(c => !c.parentId)
      .map(parent => ({
        name: parent.name,
        path: `/shop?parentCategoryId=${parent.id}`,
        subCategories: categories
          .filter(c => c.parentId === parent.id)
          .map(child => ({
            name: child.name,
            path: `/shop?categoryId=${child.id}`,
            items: [] // Could add sub-sub categories here if needed
          }))
      })),
    { name: 'Journal', path: '/blogs' },
  ];

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMegaMenu(name);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  };

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveMegaMenu(null);
  }, [location]);

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-dark/5" onMouseLeave={handleMouseLeave}>
      {/* Top Bar */}
      <div className="bg-brand-dark text-white py-1.5 sm:py-2 px-2 sm:px-4 text-[7px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center overflow-hidden whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          Free Worldwide Shipping on Orders Over $500 • Authentic Designer Wear • 24/7 Premium Support • 
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -ml-2 text-brand-dark hover:text-brand-gold transition-colors"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/Tayfa.png" alt="TAYFA" className="h-4 sm:h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:space-x-8 h-full items-center">
            {navItems.map((item) => (
              <div 
                key={item.name} 
                className="h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(item.name)}
              >
                <Link
                  to={item.path}
                  className={`relative text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center space-x-1 py-2 ${
                    item.featured ? 'text-brand-gold' : 'text-brand-dark hover:text-brand-gold'
                  }`}
                >
                  {item.featured && <Sparkles size={12} className="mr-1" />}
                  <span>{item.name}</span>
                  {item.subCategories && <ChevronDown size={12} className={`transition-transform duration-300 ${activeMegaMenu === item.name ? 'rotate-180' : ''}`} />}
                  
                  {/* Active Indicator */}
                  {location.search.includes(item.name.toLowerCase()) && (
                    <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-gold" />
                  )}
                </Link>
              </div>
            ))}
          </div>

          {/* Icons & Auth */}
            <div className="flex items-center space-x-1 sm:space-x-4">
              <div className="hidden md:block">
                <CountrySelector />
              </div>
              
              <button 
                onClick={() => setIsAISearchOpen(true)}
                className="p-2 text-brand-gold hover:text-brand-dark transition-colors flex items-center space-x-2 group"
              >
                <Sparkles size={18} className="group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-widest">AI Search</span>
              </button>

              <button className="p-2 text-brand-dark hover:text-brand-gold transition-colors hidden sm:block">
                <Search size={18} />
              </button>

            <Link to="/wishlist" className="p-2 text-brand-dark hover:text-brand-gold transition-colors relative hidden sm:block">
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[8px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-gold rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            
            <div className="hidden sm:flex items-center space-x-4 border-l border-brand-dark/5 pl-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {user.role === 'seller' && (
                    <Link 
                      to="/seller/dashboard" 
                      className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/80"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link to="/account" className="p-2 text-brand-dark hover:text-brand-gold transition-colors">
                    <User size={18} />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/seller/register" 
                    className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/80"
                  >
                    Sell on TAYFA
                  </Link>
                  <Link 
                    to="/signin" 
                    className="text-[10px] font-bold uppercase tracking-widest text-brand-dark hover:text-brand-gold"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            <Link to="/cart" className="p-2 text-brand-dark hover:text-brand-gold transition-colors relative">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[8px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-gold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mega Menu Desktop */}
      <AnimatePresence>
        {activeMegaMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:block absolute top-full left-0 w-full bg-white border-b border-brand-dark/5 shadow-xl"
            onMouseEnter={() => handleMouseEnter(activeMegaMenu)}
          >
            <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-4 gap-12">
              {navItems.find(i => i.name === activeMegaMenu)?.subCategories?.map((sub) => (
                <div key={sub.name} className="space-y-6">
                  <Link 
                    to={sub.path} 
                    className="flex items-center space-x-3 text-sm font-bold uppercase tracking-widest text-brand-dark hover:text-brand-gold transition-colors"
                  >
                    {sub.icon && <sub.icon size={18} className="text-brand-gold" />}
                    <span>{sub.name}</span>
                  </Link>
                  {sub.items && (
                    <ul className="space-y-3 border-l border-brand-dark/5 pl-4">
                      {sub.items.map(item => (
                        <li key={item.name}>
                          <Link 
                            to={item.path} 
                            className="text-sm text-brand-dark/60 hover:text-brand-gold hover:translate-x-1 transition-all block"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!sub.items && (
                    <p className="text-xs text-brand-dark/40 italic">Explore our curated {sub.name.toLowerCase()} collection.</p>
                  )}
                </div>
              ))}
              
              {/* Featured Card in Mega Menu */}
              <div className="bg-brand-cream rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10">
                  <h4 className="font-serif text-xl mb-2">Seasonal Sale</h4>
                  <p className="text-xs text-brand-dark/60 mb-4">Up to 40% off on selected items.</p>
                  <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest text-brand-gold flex items-center">
                    Shop Now <ChevronRight size={12} className="ml-1" />
                  </Link>
                </div>
                <Sparkles className="absolute -bottom-4 -right-4 text-brand-gold/10 w-32 h-32 group-hover:scale-110 transition-transform" />
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
            className="lg:hidden fixed inset-0 top-16 sm:top-20 bg-white z-40 overflow-y-auto"
          >
            <div className="px-4 py-8 space-y-2 pb-24">
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAISearchOpen(true);
                }}
                className="w-full flex items-center justify-between text-brand-gold p-4 bg-brand-gold/5 rounded-2xl mb-4 border border-brand-gold/10"
              >
                <div className="flex items-center space-x-3">
                  <Sparkles size={20} />
                  <span className="font-bold uppercase tracking-widest text-xs">Search with AI</span>
                </div>
                <ChevronRight size={18} />
              </button>

              {navItems.map((item) => (
                <div key={item.name} className="border-b border-brand-dark/5 last:border-0">
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === item.name ? null : item.name)}
                    className={`w-full flex justify-between items-center py-4 text-sm font-bold uppercase tracking-widest ${
                      item.featured ? 'text-brand-gold' : 'text-brand-dark'
                    }`}
                  >
                    <span className="flex items-center">
                      {item.featured && <Sparkles size={16} className="mr-2" />}
                      {item.name}
                    </span>
                    {item.subCategories && (
                      <ChevronDown size={18} className={`transition-transform duration-300 ${mobileExpanded === item.name ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {mobileExpanded === item.name && item.subCategories && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-brand-cream/50 rounded-2xl mb-4"
                      >
                        <div className="p-4 space-y-6">
                          {item.subCategories.map(sub => (
                            <div key={sub.name} className="space-y-3">
                              <Link to={sub.path} className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-brand-dark/80">
                                {sub.icon && <sub.icon size={14} className="text-brand-gold" />}
                                <span>{sub.name}</span>
                              </Link>
                              {sub.items && (
                                <div className="grid grid-cols-2 gap-2 pl-6">
                                  {sub.items.map(subItem => (
                                    <Link key={subItem.name} to={subItem.path} className="text-sm text-brand-dark/60 py-1">
                                      {subItem.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              <div className="pt-8 space-y-4">
                <Link to="/wishlist" className="flex items-center justify-between text-brand-dark p-4 bg-brand-cream rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Heart size={20} />
                    <span className="font-medium">My Wishlist</span>
                  </div>
                  {wishlist.length > 0 && (
                    <span className="bg-brand-gold text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link to="/account" className="flex items-center space-x-3 text-brand-dark p-4 border border-brand-dark/10 rounded-2xl">
                  <User size={20} />
                  <span className="font-medium">My Account</span>
                </Link>
                <button className="w-full flex items-center space-x-3 text-brand-dark p-4 border border-brand-dark/10 rounded-2xl">
                  <Search size={20} />
                  <span className="font-medium">Search Products</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

   
    </nav>
  );
};

export default Navbar;
