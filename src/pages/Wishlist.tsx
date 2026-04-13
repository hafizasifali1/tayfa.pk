import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2, TrendingDown, Clock, ArrowUpDown } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import Price from '../components/common/Price';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  const sortedWishlist = useMemo(() => {
    return [...wishlist].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [wishlist, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
        <div>
          <h1 className="text-5xl font-serif mb-4">My Wishlist</h1>
          <p className="text-brand-dark/60">
            {wishlist.length === 0 
              ? "Your wishlist is currently empty." 
              : `You have ${wishlist.length} item${wishlist.length === 1 ? '' : 's'} saved for later.`}
          </p>
        </div>
        
        {wishlist.length > 0 && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border border-brand-dark/5 shadow-sm">
              <ArrowUpDown size={14} className="text-brand-dark/40" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="newest">Newest Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to High</option>
              </select>
            </div>
            
            <Link 
              to="/shop" 
              className="inline-flex items-center space-x-2 text-brand-gold font-bold uppercase tracking-widest hover:text-brand-dark transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {sortedWishlist.map((product) => {
              const hasPriceDrop = product.price < product.originalPrice;
              
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="group overflow-hidden border-brand-dark/5 hover:border-brand-gold/20 transition-all">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Link to={`/product/${product.id}`}>
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                      
                      {hasPriceDrop && (
                        <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center shadow-lg">
                          <TrendingDown size={12} className="mr-1" />
                          Price Drop
                        </div>
                      )}

                      <button 
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md text-brand-dark hover:text-rose-500 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-brand-dark/40 font-bold uppercase tracking-widest">{product.brand}</span>
                          <h3 className="font-serif text-lg font-semibold mt-1">
                            <Link to={`/product/${product.id}`} className="hover:text-brand-gold transition-colors">
                              {product.name}
                            </Link>
                          </h3>
                        </div>
                        <Price 
                          amount={product.price + (product.discount || 0)} 
                          discount={product.discount} 
                          className="text-lg font-bold" 
                        />
                      </div>

                      <div className="flex items-center text-[10px] text-brand-dark/40 font-medium">
                        <Clock size={12} className="mr-1" />
                        Added {new Date(product.addedAt).toLocaleDateString()}
                      </div>

                      <div className="pt-4 flex gap-3">
                        <Button 
                          onClick={() => moveToCart(product)}
                          className="flex-grow rounded-2xl bg-brand-dark text-white hover:bg-brand-gold"
                        >
                          <ShoppingBag size={16} className="mr-2" />
                          Move to Bag
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-brand-dark/5 shadow-sm">
          <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="text-brand-dark/20" />
          </div>
          <h2 className="text-3xl font-serif mb-4">No items saved yet</h2>
          <p className="text-brand-dark/60 mb-8 max-w-md mx-auto">
            Start exploring our collection and save your favorite pieces to your wishlist.
          </p>
          <Link 
            to="/shop" 
            className="inline-block bg-brand-dark text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg hover:shadow-brand-gold/20"
          >
            Explore Shop
          </Link>
        </div>
      )}

      {/* Recommended Section (Optional) */}
      {wishlist.length > 0 && (
        <div className="mt-24">
          <h2 className="text-3xl font-serif mb-12">You Might Also Like</h2>
          {/* This could be a carousel or grid of recommended products */}
          <p className="text-brand-dark/40 italic">Recommendations coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
