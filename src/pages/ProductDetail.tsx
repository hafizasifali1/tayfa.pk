import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Share2, ChevronLeft, ChevronRight, Truck, ShieldCheck, RotateCcw, Star, CheckCircle2, Info, Ruler, Sparkles, ChevronDown, Loader2, Facebook, Twitter, Linkedin, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Price from '../components/common/Price';
import ProductCard from '../components/common/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { calculatePromotionDiscount, getSavings } from '../utils/promotionUtils';

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width={size} 
    height={size} 
    className={className}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.77a6.738 6.738 0 0 1-6.74 6.74c-3.72 0-6.74-3.02-6.74-6.74 0-3.72 3.02-6.74 6.74-6.74.1 0 .2 0 .3.01v4.03c-.1-.01-.2-.02-.3-.02-1.49 0-2.71 1.22-2.71 2.71 0 1.49 1.22 2.71 2.71 2.71 1.49 0 2.71-1.22 2.71-2.71V.02z"/>
  </svg>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [productAttributes, setProductAttributes] = useState<any[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [currentImage, setCurrentImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);



  const bestPromotion = useMemo(() => {
    if (!product || !product.applicablePromotions || product.applicablePromotions.length === 0) return null;
    return [...product.applicablePromotions].sort((a, b) => {
      const valA = a.type === 'percentage' ? a.value : 0;
      const valB = b.type === 'percentage' ? b.value : 0;
      return valB - valA;
    })[0];
  }, [product]);

  const getProductImages = (images: any): string[] => {
    const fallback = ['https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop'];
    if (!images) return fallback;
    try {
      const parsed = typeof images === 'string' ? JSON.parse(images) : images;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (typeof parsed === 'string' && parsed.length > 10) return [parsed];
      return fallback;
    } catch (e) {
      if (typeof images === 'string' && images.length > 10) return [images];
      return fallback;
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/products/${id}`);
        const currentProduct = response.data;
        setProduct(currentProduct);

        try {
          const attrResponse = await axios.get(`/api/attributes/products/${currentProduct.id}`);
          if (attrResponse.data.success) {
            // Group by attribute name/type
            const grouped: any[] = [];
            attrResponse.data.data.forEach((item: any) => {
              let existing = grouped.find(g => g.attributeId === item.attributeId);
              if (!existing) {
                existing = { 
                  attributeId: item.attributeId, 
                  name: item.attributeName, 
                  displayType: item.displayType, 
                  isRequired: item.isRequired === 1 || item.isRequired === true,
                  values: [] 
                };
                grouped.push(existing);
              }
              existing.values.push(item);
            });
            setProductAttributes(grouped);
          }
        } catch (err) {
          console.error('Error fetching attributes:', err);
        }

        // Fetch category-specific attributes (filters with isAttribute=true)
        try {
          const catAttrResponse = await axios.get(`/api/products/${id}/attributes`);
          if (Array.isArray(catAttrResponse.data)) {
            setCategoryAttributes(catAttrResponse.data);
          }
        } catch (err) {
          console.error('Error fetching category attributes:', err);
        }

        const allProductsResponse = await axios.get('/api/products');
        const allProducts = allProductsResponse.data;
        
        const related = allProducts
          .filter((p: any) => {
            if (p.id === currentProduct.id) return false;
            
            const categoryMatch = p.categoryId === currentProduct.categoryId || 
                                p.parentCategoryId === currentProduct.parentCategoryId;
            
            const tagMatch = p.tags?.some((tag: string) => currentProduct.tags?.includes(tag));
            
            return categoryMatch || tagMatch;
          })
          .sort((a: any, b: any) => {
            const aCatMatch = a.categoryId === currentProduct.categoryId;
            const bCatMatch = b.categoryId === currentProduct.categoryId;
            const aTagMatch = a.tags?.some((tag: string) => currentProduct.tags?.includes(tag));
            const bTagMatch = b.tags?.some((tag: string) => currentProduct.tags?.includes(tag));
            
            if ((aCatMatch && aTagMatch) && !(bCatMatch && bTagMatch)) return -1;
            if (!(aCatMatch && aTagMatch) && (bCatMatch && bTagMatch)) return 1;
            if (aCatMatch && !bCatMatch) return -1;
            if (!aCatMatch && bCatMatch) return 1;
            return 0;
          })
          .slice(0, 10);
        setRelatedProducts(related);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const carouselRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' 
        ? scrollLeft - scrollAmount 
        : scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <h2 className="text-3xl font-serif">Product not found</h2>
        <Link to="/shop" className="bg-brand-gold text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    // Validate required attributes
    const missingRequired = productAttributes.find(a => (a.isRequired || a.name.toLowerCase().includes('size')) && !selectedAttributes[a.attributeId]);
    if (missingRequired) {
      alert(`Please select a ${missingRequired.name}`);
      return;
    }

    // Build attributes map: attribute name → selected value
    const attributes: Record<string, string> = {};
    productAttributes.forEach(attr => {
      const valId = selectedAttributes[attr.attributeId];
      if (valId) {
        const valObj = attr.values.find((v: any) => v.valueId === valId);
        if (valObj) attributes[attr.name] = valObj.value;
      }
    });

    await addToCart(product, Object.keys(attributes).length > 0 ? attributes : undefined, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const renderDynamicSelectors = () => {
    if (productAttributes.length === 0 && categoryAttributes.length === 0) return null;
    return (
      <div className="space-y-8 pt-6">
        {/* Global Attributes */}
        {productAttributes.map(attr => {
          const isSize = attr.name.toLowerCase().includes('size');
          const selectedId = selectedAttributes[attr.attributeId];
          const selectedVal = attr.values.find((v: any) => v.valueId === selectedId)?.value;

          return (
            <motion.div 
              key={attr.attributeId} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-dark">
                    {attr.name} {attr.isRequired && <span className="text-red-500">*</span>}
                  </h3>
                  {selectedVal && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[11px] font-black uppercase tracking-[0.1em] text-brand-gold-dark bg-brand-gold/5 px-2 py-0.5 rounded-md"
                    >
                      {selectedVal}
                    </motion.span>
                  )}
                </div>
                {isSize && (
                  <button className="text-[10px] text-brand-gold-dark hover:text-brand-dark transition-all flex items-center space-x-1 group">
                    <Ruler size={14} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-bold uppercase tracking-widest border-b border-brand-gold-dark/30 pb-0.5">Size Guide</span>
                  </button>
                )}
              </div>

              {attr.displayType === 'color_swatch' ? (
                <div className="flex flex-wrap gap-4 p-1">
                  {attr.values.map((v: any) => (
                    <div key={v.valueId} className="flex flex-col items-center space-y-2">
                      <button
                        onClick={() => setSelectedAttributes(prev => ({ ...prev, [attr.attributeId]: v.valueId }))}
                        className={`group relative w-12 h-12 rounded-full transition-all flex items-center justify-center p-0.5 ${
                          selectedId === v.valueId 
                            ? 'ring-2 ring-brand-gold ring-offset-4 scale-110' 
                            : 'ring-1 ring-brand-dark/5 ring-offset-0 hover:ring-2 hover:ring-brand-gold/40 hover:scale-105'
                        }`}
                        title={v.value}
                      >
                        <div 
                          className="w-full h-full rounded-full shadow-lg border border-white/20"
                          style={{ backgroundColor: v.colorCode || '#ccc' }}
                        />
                        {selectedId === v.valueId && (
                          <motion.div 
                            layoutId={`selected-${attr.attributeId}`}
                            className="absolute -top-1 -right-1 bg-brand-gold text-white rounded-full p-1 shadow-xl z-10"
                          >
                            <CheckCircle2 size={12} className="stroke-[3]" />
                          </motion.div>
                        )}
                      </button>
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                        selectedId === v.valueId ? 'text-brand-gold-dark scale-110' : 'text-brand-dark/60 hover:text-brand-dark'
                      }`}>
                        {v.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : attr.displayType === 'dropdown' ? (
                <div className="relative group max-w-sm">
                  <select
                    value={selectedId || ''}
                    onChange={(e) => setSelectedAttributes(prev => ({ ...prev, [attr.attributeId]: e.target.value }))}
                    className="w-full bg-white border-2 border-brand-dark/5 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest appearance-none focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold/30 transition-all cursor-pointer shadow-sm group-hover:border-brand-gold/20"
                  >
                    <option value="">Select {attr.name}</option>
                    {attr.values.map((v: any) => (
                      <option key={v.valueId} value={v.valueId}>{v.value}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-brand-gold transition-colors">
                    <ChevronDown size={18} className="text-brand-dark/30" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {attr.values.map((v: any) => (
                    <button
                      key={v.valueId}
                      onClick={() => setSelectedAttributes(prev => ({ ...prev, [attr.attributeId]: v.valueId }))}
                      className={`relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border-2 overflow-hidden group/btn ${
                        selectedId === v.valueId
                          ? 'bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20 scale-[1.02]'
                          : 'bg-white text-brand-dark border-brand-dark/5 hover:border-brand-gold/30 hover:shadow-lg'
                      }`}
                    >
                      <span className="relative z-10">{v.value}</span>
                      {selectedId === v.valueId && (
                        <motion.div 
                          layoutId={`active-bg-${attr.attributeId}`}
                          className="absolute inset-0 bg-brand-dark"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Category Specific Attributes/Filters */}
        {categoryAttributes.map(attr => (
          <motion.div 
            key={attr.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-dark">
              {attr.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(attr.values || []).map((val: string, idx: number) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 bg-brand-cream/30 border border-brand-dark/5 rounded-lg text-[10px] font-bold text-brand-dark/70 uppercase tracking-widest"
                >
                  {val}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Image Gallery */}
        <div className="lg:w-1/2 space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-brand-cream shadow-xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={getProductImages(product.images)[currentImage] || getProductImages(product.images)[0]}
                alt={product.name}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            {getProductImages(product.images).length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImage(prev => (prev === 0 ? getProductImages(product.images).length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-gold hover:text-white transition-all shadow-lg z-10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCurrentImage(prev => (prev === getProductImages(product.images).length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-gold hover:text-white transition-all shadow-lg z-10"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
              {/* product.isNew Arrival tag removed as per request */}
              {product.isBestSeller && (
                <span className="bg-brand-dark text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Best Seller</span>
              )}
              {bestPromotion && (
                <div className="group relative">
                  <span className="bg-brand-gold text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center cursor-help">
                    <Sparkles size={14} className="mr-2" />
                    {bestPromotion.name || "Special Offer"}
                  </span>
                  {bestPromotion.description && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white p-4 rounded-2xl shadow-xl border border-brand-gold/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                      <p className="text-xs text-brand-dark leading-relaxed font-medium">
                        {bestPromotion.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {getProductImages(product.images).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`relative flex-shrink-0 w-24 aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${
                  currentImage === idx ? 'border-brand-gold ring-4 ring-brand-gold/10' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:w-1/2 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-brand-gold-dark font-bold uppercase tracking-[0.3em] text-sm">{product.brand}</span>
              {product.rating && (
                <div className="flex items-center space-x-2 bg-brand-gold/10 px-3 py-1 rounded-full">
                  <Star size={16} className="fill-brand-gold text-brand-gold" />
                  <span className="text-sm font-bold text-brand-gold-dark">{product.rating}</span>
                  <span className="text-xs text-brand-gold-dark/60 font-medium">({product.numReviews} Reviews)</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-serif leading-tight text-brand-dark font-medium">{product.name}</h1>
            
            <div className="flex items-center space-x-4">
              <Price 
                amount={product.price} 
                discount={product.salePrice ? (product.price - product.salePrice) : product.discount} 
                className="text-3xl font-medium text-brand-dark" 
                showLocalMessage 
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {product.parentCategory && (
                <span className="px-3 py-1 bg-brand-dark/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-dark-muted">
                  {product.parentCategory}
                </span>
              )}
              {product.category && (
                <span className="px-3 py-1 bg-brand-gold/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-gold-dark">
                  {product.category}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-dark">Description</h3>
            <p className="text-brand-dark-muted leading-relaxed text-sm font-normal">{product.description}</p>
          </div>

          {/* Dynamic Attribute Selectors */}
          {renderDynamicSelectors()}

          {/* Quantity Selector */}
          <div className="space-y-2 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark">Quantity</h3>
            <div className="flex items-center bg-brand-cream/50 border border-brand-dark/10 rounded-xl w-fit p-1">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:text-brand-gold transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-bold text-brand-dark">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:text-brand-gold transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-6">

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-grow flex items-center justify-center space-x-3 px-6 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                  isAdded 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-brand-dark text-white hover:bg-brand-gold'
                }`}
              >
                <ShoppingBag size={18} />
                <span>{isAdded ? 'Added to Bag' : `Add ${quantity > 1 ? quantity + ' Items' : 'to Bag'}`}</span>
              </button>
              <button 
                onClick={() => toggleWishlist(product)}
                className={`flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all group shadow-sm flex-shrink-0 ${
                  isInWishlist(product.id) 
                    ? 'bg-rose-500 border-rose-500 text-white' 
                    : 'border-brand-dark/10 hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                <Heart size={20} className={isInWishlist(product.id) ? 'fill-current' : 'group-hover:fill-brand-gold'} />
              </button>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2 text-xs font-medium">
              <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={product.stock > 10 ? 'text-emerald-600' : 'text-amber-600'}>
                {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock`}
              </span>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="space-y-3 pt-4 border-t border-brand-dark/5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Share this product</h3>
              <div className="flex items-center gap-4">
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark hover:bg-[#1877F2] hover:text-white transition-all shadow-sm"
                  title="Share on Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this ${product.name}!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm"
                  title="Share on Twitter"
                >
                  <Twitter size={18} />
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark hover:bg-[#0A66C2] hover:text-white transition-all shadow-sm"
                  title="Share on LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
                <a 
                  href="https://www.tiktok.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark hover:bg-black hover:text-white transition-all shadow-sm"
                  title="Share on TikTok"
                >
                  <TikTokIcon size={18} />
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-dark hover:bg-brand-gold hover:text-white transition-all shadow-sm"
                  title="Copy Link"
                >
                  <Share2 size={18} />
                </button>
              </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-brand-dark/5">
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all">
                <Truck size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all">
                <ShieldCheck size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all">
                <RotateCcw size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Easy Returns</span>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="pt-4 space-y-2">
            {[
              { icon: Info, title: 'Product Details', content: 'Hand-crafted with premium materials. Features intricate embroidery and a modern silhouette designed for comfort and style.' },
              { icon: Ruler, title: 'Size & Fit', content: 'True to size. Model is 5\'10" and wearing a size Small. Please refer to our size guide for detailed measurements.' },
              { icon: Sparkles, title: 'Care Instructions', content: 'Dry clean only. Handle with care to preserve the delicate embroidery and fabric quality.' }
            ].map((item) => (
              <details key={item.title} className="group border-b border-brand-dark/5 pb-4">
                <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} className="text-brand-gold-dark" />
                    <span className="text-sm font-bold uppercase tracking-widest text-brand-dark">{item.title}</span>
                  </div>
                  <ChevronDown size={18} className="text-brand-dark-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pt-4 text-brand-dark-muted text-sm leading-relaxed pl-7 font-medium">
                  {item.content}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 lg:mt-32 pt-10 lg:pt-20 border-t border-brand-dark/5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-brand-gold uppercase tracking-[0.3em] font-bold text-[10px] sm:text-xs mb-2 sm:mb-4 block">You Might Also Like</span>
              <h2 className="text-3xl sm:text-4xl font-serif">Complete the Look</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2 mr-4">
                <button 
                  onClick={() => scroll('left')}
                  className="w-10 h-10 rounded-full border border-brand-dark/10 flex items-center justify-center text-brand-dark hover:bg-brand-gold hover:text-white transition-all shadow-sm"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="w-10 h-10 rounded-full border border-brand-dark/10 flex items-center justify-center text-brand-dark hover:bg-brand-gold hover:text-white transition-all shadow-sm"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <Link to="/shop" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors border-b-2 border-brand-gold pb-1 w-fit">
                View All
              </Link>
            </div>
          </div>
          
          <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {relatedProducts.map((p) => (
              <motion.div 
                key={p.id}
                className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
                whileHover={{ y: -10 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
