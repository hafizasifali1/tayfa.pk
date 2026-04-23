import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Star, Heart, Sparkles, Check } from 'lucide-react';
import { Product, Promotion } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Price from './Price';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = React.useState(false);

  const getProductImage = (images: any) => {
    if (!images) return 'https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop';
    try {
      const parsed = typeof images === 'string' ? JSON.parse(images) : images;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      if (typeof parsed === 'string' && parsed.length > 10) return parsed;
      return 'https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop';
    } catch (e) {
      if (typeof images === 'string' && images.length > 10) return images;
      return 'https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop';
    }
  };

  const activePromotion = useMemo(() => {
    const promotions: Promotion[] = JSON.parse(localStorage.getItem('tayfa_promotions') || '[]');
    return promotions.find(p => p.isActive);
  }, []);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return; // prevent double-click
    setIsAdding(true);
    const defaultSize = Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes[0]
      : (typeof product.sizes === 'string'
          ? (() => { try { const p = JSON.parse(product.sizes as any); return Array.isArray(p) && p.length > 0 ? p[0] : undefined; } catch { return undefined; } })()
          : undefined);
    try {
      await addToCart(product, defaultSize || undefined);
    } finally {
      setTimeout(() => setIsAdding(false), 1500);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isWishlisted = isInWishlist(product.id);

  if (viewMode === 'list') {
    return (
      <div className="group flex flex-col sm:flex-row gap-8 bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
        <div className="relative w-full sm:w-64">
          <Link 
            to={`/product/${product.slug}`} 
            className="block aspect-[3/4] rounded-2xl overflow-hidden bg-brand-cream relative group-hover:shadow-2xl transition-all duration-700"
          >
            <img 
              src={getProductImage(product.images)} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </Link>
          
          {activePromotion && (
            <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] flex items-center shadow-lg shadow-emerald-500/20 z-20">
              <Sparkles size={10} className="mr-1" />
              Promo
            </span>
          )}

          <button 
            onClick={handleToggleWishlist}
            className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all z-10 ${
              isWishlisted ? 'bg-rose-500 text-white' : 'bg-white text-brand-dark hover:bg-rose-50 text-rose-500'
            }`}
          >
            <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        </div>

        <div className="flex-grow flex flex-col justify-center space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs text-brand-dark-muted font-bold uppercase tracking-widest">{product.brand}</span>
            {product.rating && (
              <div className="flex items-center space-x-1">
                <Star size={12} className="fill-brand-gold text-brand-gold" />
                <span className="text-xs font-bold text-brand-dark">{product.rating}</span>
              </div>
            )}
          </div>
          
          <h3 className="font-serif text-2xl font-semibold group-hover:text-brand-gold transition-colors">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          
          <div className="flex items-center space-x-2">
            {product.parentCategory && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-brand-dark/5 rounded text-brand-dark-muted">
                {product.parentCategory}
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-brand-gold/10 rounded text-brand-gold-dark">
              {product.category}
            </span>
          </div>

          <p className="text-brand-dark-muted text-sm line-clamp-2 leading-relaxed">{product.description}</p>
          
          <div className="flex items-center justify-between pt-2">
            <Price 
              amount={product.price + (product.discount || 0)} 
              discount={product.discount} 
              productId={product.id} 
              className="text-2xl font-medium" 
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              onClick={handleAddToCart}
              className="bg-brand-dark text-white px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-brand-gold transition-colors"
            >
              Add to Cart
            </button>
            <Link to={`/product/${product.slug}`} className="border border-brand-dark text-brand-dark px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-brand-dark hover:text-white transition-colors">
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-2xl bg-brand-cream aspect-[4/5] mb-4">
        <Link to={`/product/${product.slug}`} className="block h-full">
          <img 
            src={getProductImage(product.images)} 
            alt={product.name} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop';
            }}
          />
        </Link>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-brand-gold text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-lg shadow-brand-gold/20">New</span>
          )}
          {product.isBestSeller && (
            <span className="bg-brand-dark text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-lg shadow-brand-dark/20">Best Seller</span>
          )}
          {activePromotion && (
            <span className="bg-emerald-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] flex items-center shadow-lg shadow-emerald-500/20">
              <Sparkles size={10} className="mr-1" />
              Promo
            </span>
          )}
        </div>

        <button 
          onClick={handleToggleWishlist}
          className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all z-10 ${
            isWishlisted ? 'bg-rose-500 text-white' : 'bg-white text-brand-dark hover:bg-rose-50 text-rose-500'
          }`}
        >
          <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
        </button>

        <div className="absolute inset-0 bg-brand-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <button 
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`p-4 rounded-full transition-all shadow-lg ${
              isAdding ? 'bg-emerald-500 text-white' : 'bg-white text-brand-dark hover:bg-brand-gold hover:text-white'
            }`}
            title="Add to Cart"
          >
            {isAdding ? <Check size={20} /> : <ShoppingBag size={20} />}
          </button>
          <Link 
            to={`/product/${product.slug}`}
            className="p-4 bg-white text-brand-dark rounded-full hover:bg-brand-gold hover:text-white transition-colors shadow-lg"
            title="View Details"
          >
            <Eye size={20} />
          </Link>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <span className="text-[10px] text-brand-dark-muted uppercase tracking-[0.2em] font-bold">{product.brand}</span>
          {product.rating && (
            <div className="flex items-center space-x-1">
              <Star size={10} className="fill-brand-gold text-brand-gold" />
              <span className="text-[10px] font-bold text-brand-dark">{product.rating}</span>
            </div>
          )}
        </div>
        
        <h3 className="font-serif text-base font-semibold group-hover:text-brand-gold transition-colors line-clamp-1">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        
        <div className="flex items-center space-x-2">
          {product.parentCategory && (
            <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-brand-dark/5 rounded text-brand-dark-muted">
              {product.parentCategory}
            </span>
          )}
          <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-brand-gold/10 rounded text-brand-gold-dark">
            {product.category}
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <Price 
            amount={product.price + (product.discount || 0)} 
            discount={product.discount} 
            productId={product.id} 
            className="text-sm font-bold" 
          />
          <button 
            onClick={handleAddToCart}
            className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
