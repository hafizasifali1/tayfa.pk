import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Truck, 
  ShieldCheck, RotateCcw, CheckCircle2, AlertCircle, Heart, 
  ChevronDown, Lock, CreditCard, Apple, Check, Loader2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { useWishlist } from '../context/WishlistContext';
import Price from '../components/common/Price';
import { motion, AnimatePresence } from 'motion/react';
import { Coupon, Promotion } from '../types';
import { calculatePromotionDiscount, formatPromotionLabel, getSavings, checkPromotionStatus } from '../utils/promotionUtils';
import { Sparkles, Gift, Zap, DollarSign } from 'lucide-react';

const ShoppingBagPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, isLoading } = useCart();
  const { user } = useAuth();
  const { openModal } = useAuthModal();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCouponSuccess, setIsCouponSuccess] = useState(false);

  const getProductImage = (image: any, images?: any) => {
    // 1. Primary check: image or imageUrl passed directly
    if (image && typeof image === 'string' && image.length > 5) {
      if (image.startsWith('http') || image.startsWith('/') || image.startsWith('data:')) {
        return image;
      }
    }
    
    // 2. Secondary check: backup images array
    if (images) {
      try {
        const parsed = typeof images === 'string' ? JSON.parse(images) : images;
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          return parsed[0];
        }
        if (typeof parsed === 'string' && parsed.length > 5) return parsed;
      } catch (e) { }
    }
    
    // 3. Final Fallback: Premium generic placeholder
    return 'https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop';
  };

  const FREE_SHIPPING_THRESHOLD = 200;
  const SHIPPING_COST = 15;
  const TAX_RATE = 0.08;

  const autoPromoDiscount = useMemo(() => {
    return cart.reduce((total, item) => {
      const bestPromo = calculatePromotionDiscount(item as any, item.qty);
      if (bestPromo) {
        return total + getSavings(item.price, bestPromo as any, item.qty);
      }
      return total;
    }, 0);
  }, [cart]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponError('');
    setIsApplyingCoupon(true);
    setIsCouponSuccess(false);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode,
          subtotal: cartTotal,
          items: cart.map(item => ({ id: item.id, sellerId: item.sellerId }))
        })
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedCoupon({
          id: data.code,
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          isActive: true,
          sellerId: 'admin'
        } as any);
        setIsCouponSuccess(true);
        setCouponCode('');
        setTimeout(() => setIsCouponSuccess(false), 3000);
      } else {
        setCouponError(data.message + (data.details ? `: ${data.details}` : ''));
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (cartTotal * appliedCoupon.discountValue) / 100;
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, cartTotal]);

  // --- Dynamic Promotions Logic ---
  const promoStatus = useMemo(() => {
    // Find all items with a promotion status
    const statuses = cart.map(item => ({
      item,
      promo: checkPromotionStatus(item as any)
    })).filter(s => s.promo !== null);

    if (statuses.length === 0) return null;

    // Prioritize "Almost There" if it exists, otherwise show the best "Applied" one
    const almost = statuses.find(s => s.promo?.status === 'almost');
    if (almost) return almost;

    const applied = statuses.filter(s => s.promo?.status === 'applied');
    if (applied.length > 0) {
      return applied.reduce((max, curr) => 
        (curr.promo?.savings || 0) > (max.promo?.savings || 0) ? curr : max
      );
    }

    return null;
  }, [cart]);

  // Virtual Free Gifts Calculation
  const freeGifts = useMemo(() => {
    return cart.flatMap(item => {
      const bestPromo = calculatePromotionDiscount(item as any, item.qty);
      if (bestPromo && bestPromo.type === 'buy_x_get_y_free') {
        const multipliers = Math.floor(item.qty / (bestPromo.buyQuantity || 1));
        const giftQty = multipliers * (bestPromo.getQuantity || 0);
        
        if (giftQty > 0) {
          return [{
            ...item,
            cartItemId: `gift-${item.id}`,
            name: `FREE Gift — ${item.name}`,
            qty: giftQty,
            price: 0,
            originalPrice: item.price,
            isFreeGift: true
          }];
        }
      }
      return [];
    });
  }, [cart]);

  const displayItems = useMemo(() => [...cart, ...freeGifts], [cart, freeGifts]);

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxes = (cartTotal - autoPromoDiscount - discountAmount) * TAX_RATE;
  const finalTotal = Math.max(0, cartTotal - autoPromoDiscount - discountAmount + shipping + taxes);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 sm:p-20 rounded-[2rem] shadow-xl border border-brand-gold/10 max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center text-brand-gold mx-auto mb-8">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-4xl font-serif mb-4">Your bag is empty</h2>
          <p className="text-brand-dark/60 mb-10 text-lg">Looks like you haven't added anything to your bag yet. Explore our latest collections and find something you love.</p>
          <Link 
            to="/shop" 
            className="inline-block bg-gradient-to-r from-brand-gold to-brand-gold text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-brand-gold/20 transition-all"
          >
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream/30 pb-32 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-serif">Your Bag <span className="text-brand-dark/30 ml-2">({cartCount})</span></h1>
          <Link to="/shop" className="hidden sm:flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold transition-colors">
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Guest Login Prompt Banner */}
        {/* Savings Alert Banner */}
        <AnimatePresence mode="wait">
          {promoStatus && (
            <motion.div
              key={promoStatus.promo?.status + '-' + promoStatus.item.id}
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`mb-8 p-4 rounded-2xl border shadow-sm ${
                promoStatus.promo?.status === 'applied' 
                  ? (promoStatus.promo?.promotion?.type === 'buy_x_get_y_free' 
                      ? 'bg-brand-gold/10 border-brand-gold/30' 
                      : (promoStatus.promo?.promotion?.type === 'fixed_amount' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-emerald-50 border-emerald-200'))
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    promoStatus.promo?.status === 'applied'
                      ? (promoStatus.promo?.promotion?.type === 'buy_x_get_y_free' ? 'bg-brand-gold text-white' : 'bg-emerald-100 text-emerald-600')
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {promoStatus.promo?.status === 'applied' 
                      ? (promoStatus.promo?.promotion?.type === 'buy_x_get_y_free' ? <Gift size={24} /> : <CheckCircle2 size={24} />)
                      : <Zap size={24} />
                    }
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-bold text-brand-dark">
                      {promoStatus.promo?.status === 'applied' 
                        ? (promoStatus.promo?.promotion?.type === 'buy_x_get_y_free' 
                            ? "Congratulations! You've unlocked a FREE product!" 
                            : `Congratulations! You're saving PKR ${promoStatus.promo?.savings?.toLocaleString()} on this order!`)
                        : `Add ${promoStatus.promo?.remaining} more to unlock ${promoStatus.promo?.promotion?.value}${promoStatus.promo?.promotion?.type === 'percentage' ? '%' : ''} OFF!`
                      }
                    </h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mt-0.5">
                      {promoStatus.item.name} — {promoStatus.promo?.promotion?.name || formatPromotionLabel(promoStatus.promo?.promotion as any)}
                    </p>
                    
                    {promoStatus.promo?.status === 'almost' && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-[9px] font-black uppercase text-brand-dark/30">
                          <span>Progress</span>
                          <span>{promoStatus.item.qty} of {promoStatus.promo?.promotion?.buyQuantity} items</span>
                        </div>
                        <div className="h-1.5 w-full bg-brand-dark/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${promoStatus.promo?.progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-brand-gold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {promoStatus.promo?.status === 'applied' && (
                  <div className="flex-shrink-0 bg-white/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-dark/60 border border-brand-dark/5">
                    applied ✓
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-brand-dark text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                <Lock size={18} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-sm font-bold">Sign in to sync your bag</p>
                <p className="text-[10px] text-white/50 font-medium mt-0.5">Your cart is saved locally. Sign in to access it across all your devices.</p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => openModal('signin')}
                className="px-5 py-2.5 bg-brand-gold text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-gold/80 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openModal('signup')}
                className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
              >
                Register
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* LEFT SECTION — CART ITEMS (70%) */}
          <div className="lg:w-[70%] space-y-6">
            <AnimatePresence>
              {displayItems.map((item) => (
                <motion.div
                  key={item.cartItemId || `${item.id}-${item.variantId}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-6 rounded-2xl shadow-sm border flex flex-col sm:flex-row gap-6 group relative ${
                    (item as any).isFreeGift ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-brand-dark/5'
                  }`}
                >
                  {/* Product Image */}
                  <Link to={`/product/${item.id}`} className="block w-24 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0 bg-brand-cream mx-auto sm:mx-0">
                    <img 
                      src={getProductImage(item.imageUrl || (item as any).image)} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                    />
                  </Link>
                  
                  {/* Product Details */}
                  <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                        <div className="w-full sm:w-auto">
                          <h3 className="text-base sm:text-xl font-serif hover:text-brand-gold transition-colors truncate sm:whitespace-normal">
                            {item.name}
                          </h3>
                          
                          {/* Variant & Quantity */}
                          <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                            {/* Variant badge */}
                            {item.variantId && item.variantId !== 'default' && (
                              <span className="bg-brand-cream/80 border border-brand-dark/5 rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">
                                {item.variantId}
                              </span>
                            )}

                            {/* Quantity Selector */}
                            <div className="flex items-center bg-brand-cream/50 border border-brand-dark/5 rounded-lg p-0.5 sm:p-1">
                              <button 
                                onClick={() => updateQuantity(item.id, item.variantId, item.qty - 1, item.cartItemId)}
                                disabled={(item as any).isFreeGift}
                                className="p-1 hover:text-brand-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="w-5 sm:w-6 text-center text-[9px] sm:text-[10px] font-bold">{item.qty}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.variantId, item.qty + 1, item.cartItemId)}
                                disabled={(item as any).isFreeGift}
                                className="p-1 hover:text-brand-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Plus size={10} />
                              </button>
                            </div>

                            {/* Applied Promotion Badge */}
                            {calculatePromotionDiscount(item as any, item.qty) && (
                              <div className="flex items-center space-x-1.5 bg-brand-gold/10 text-brand-gold px-2 py-1 rounded-lg border border-brand-gold/10">
                                <Sparkles size={10} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">
                                  {formatPromotionLabel(calculatePromotionDiscount(item as any, item.qty) as any)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-dark/5">
                          {(item as any).isFreeGift ? (
                            <span className="bg-emerald-100 text-emerald-700 font-black text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest">Free</span>
                          ) : (
                            <Price 
                              amount={(item.originalPrice || item.price) * item.qty}
                              discount={item.originalPrice ? (item.originalPrice - item.price) * item.qty : 0}
                              className="text-base sm:text-xl font-bold text-brand-dark" 
                            />
                          )}
                          {item.qty > 1 && (
                            <p className="text-[9px] sm:text-[10px] text-brand-dark/40 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                              <Price 
                                amount={item.originalPrice || item.price} 
                                discount={item.originalPrice ? (item.originalPrice - item.price) : 0}
                              /> each
                            </p>
                          )}
                        </div>
                      </div>

                      {/* UX Enhancements */}
                      <div className="flex flex-wrap gap-3 sm:gap-4 pt-1 sm:pt-2">
                        <div className="flex items-center space-x-1 sm:space-x-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                          <Truck size={10} />
                          <span>Delivers in 3–5 days</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4 sm:space-x-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-brand-dark/5">
                      {! (item as any).isFreeGift && (
                        <button 
                          onClick={() => removeFromCart(item.id, item.variantId, item.cartItemId)}
                          className="flex items-center space-x-1.5 sm:space-x-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* RIGHT SECTION — ORDER SUMMARY (30%) */}
          <div className="lg:w-[30%]">
            <div className="sticky top-32 space-y-6">
              {/* Order Summary Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-dark/5 space-y-8">
                <h2 className="text-2xl font-serif">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-dark/60 font-medium">Subtotal</span>
                    <Price amount={cartTotal} className="font-bold" />
                  </div>
                  
                  {autoPromoDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-gold font-medium flex items-center gap-1.5">
                        <Sparkles size={14} />
                        Promotion Discount
                      </span>
                      <span className="text-brand-gold font-bold">- <Price amount={autoPromoDiscount} /></span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                        <Tag size={14} />
                        Discount ({appliedCoupon.code})
                      </span>
                      <span className="text-emerald-600 font-bold">- <Price amount={discountAmount} /></span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-brand-dark/60 font-medium">Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Free</span>
                    ) : (
                      <Price amount={shipping} className="font-bold" />
                    )}
                  </div>

                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-brand-dark/60 font-medium font-serif">Estimated Tax</span>
                    <Price amount={taxes} className="font-bold" />
                  </div>

                  <div className="pt-6 border-t border-brand-dark/5 flex justify-between items-end">
                    <div>
                      <span className="text-base font-serif block">Total</span>
                      <span className="text-[9px] text-brand-dark/40 font-bold uppercase tracking-widest">Including VAT</span>
                    </div>
                    <Price amount={finalTotal} className="text-lg font-bold text-brand-gold" />
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="pt-4">
                  {!appliedCoupon ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Promo Code" 
                          disabled={isApplyingCoupon}
                          className="flex-grow bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors disabled:opacity-50"
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCode}
                          className="bg-brand-dark text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:bg-brand-dark/40 flex items-center justify-center min-w-[100px]"
                        >
                          {isApplyingCoupon ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <div className="flex items-center space-x-2 text-rose-500 text-[10px] font-bold uppercase tracking-widest">
                          <AlertCircle size={14} />
                          <span>{couponError}</span>
                        </div>
                      )}
                      {isCouponSuccess && (
                        <div className="flex items-center space-x-2 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                          <CheckCircle2 size={14} />
                          <span>Coupon Applied Successfully!</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <motion.div 
                      key="applied-coupon"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between bg-brand-gold/5 p-4 rounded-xl border border-brand-gold/10"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                          <Tag size={16} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/80">{appliedCoupon.code}</span>
                            <span className="text-[9px] bg-brand-gold text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Applied</span>
                          </div>
                          <p className="text-[10px] text-brand-dark/40 font-bold uppercase tracking-widest">
                            {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : <Price amount={appliedCoupon.discountValue} />} Discount
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setAppliedCoupon(null); setIsCouponSuccess(false); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 text-brand-dark/20 hover:text-rose-500 transition-all"
                        title="Remove Coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Savings Callout */}
                {autoPromoDiscount > 0 && (
                  <div className="bg-brand-gold/10 rounded-xl p-3 flex items-center justify-center space-x-2 border border-brand-gold/10">
                    <Tag size={14} className="text-brand-gold" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold-dark">
                      🏷 You're saving PKR {autoPromoDiscount.toLocaleString()} today!
                    </span>
                  </div>
                )}

                {/* Checkout Button */}
                <div className="space-y-4">
                  <p className="text-[10px] text-center font-bold uppercase tracking-widest text-brand-dark/40">You're almost there</p>
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-brand-gold to-brand-gold text-white py-3.5 rounded-xl font-bold uppercase tracking-widest hover:shadow-xl hover:shadow-brand-gold/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={16} />
                  </button>
                  <Link 
                    to="/shop"
                    className="w-full flex items-center justify-center py-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 hover:text-brand-gold transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-brand-dark/5 px-4 py-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.12)] backdrop-blur-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)} className="cursor-pointer flex-shrink-0 pr-4 border-r border-brand-dark/5">
            <p className="text-[9px] text-brand-dark/40 font-bold uppercase tracking-widest mb-0.5">Total</p>
            <div className="flex items-center space-x-1.5">
              <Price amount={finalTotal} className="text-lg font-bold text-brand-gold" />
              <ChevronDown size={14} className={`text-brand-dark/40 transition-transform duration-300 ${isSummaryCollapsed ? '' : 'rotate-180'}`} />
            </div>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="flex-grow bg-brand-gold text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-brand-gold/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Collapsible Mobile Summary */}
        <AnimatePresence>
          {!isSummaryCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 pb-2 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-dark/60">Subtotal</span>
                  <Price amount={cartTotal} />
                </div>
                {autoPromoDiscount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-600">Promotions</span>
                    <span className="text-emerald-600">- <Price amount={autoPromoDiscount} /></span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-600">Discount</span>
                    <span className="text-emerald-600">- <Price amount={discountAmount} /></span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-brand-dark/60">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : <Price amount={shipping} />}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-brand-dark/60">Tax</span>
                  <Price amount={taxes} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShoppingBagPage;
