import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Truck, 
  ShieldCheck, RotateCcw, CheckCircle2, AlertCircle, Heart, 
  ChevronDown, Lock, CreditCard, Apple, Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Price from '../components/common/Price';
import { motion, AnimatePresence } from 'motion/react';
import { products } from '../data/products';
import { Coupon } from '../types';

const ShoppingBagPage = () => {
  const { cart, removeFromCart, updateQuantity, updateSize, cartTotal, cartCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);

  const FREE_SHIPPING_THRESHOLD = 200;
  const SHIPPING_COST = 15;
  const TAX_RATE = 0.08;

  const recommendedItems = products.slice(0, 4);

  const handleApplyCoupon = () => {
    setCouponError('');
    // In a real app, this would be an API call. 
    // For now, we'll check local storage or a mock list.
    const coupons: Coupon[] = JSON.parse(localStorage.getItem('tayfa_coupons') || '[]');
    
    // Mock some coupons if none exist
    const mockCoupons: Coupon[] = [
      {
        id: '1',
        sellerId: 'admin',
        code: 'FASHION10',
        description: '10% off your order',
        discountType: 'percentage',
        discountValue: 10,
        minPurchaseAmount: 50,
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        usageCount: 0,
        isActive: true
      },
      {
        id: '2',
        sellerId: 'admin',
        code: 'SAVE20',
        description: '$20 off your order',
        discountType: 'fixed_amount',
        discountValue: 20,
        minPurchaseAmount: 100,
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        usageCount: 0,
        isActive: true
      }
    ];

    const allCoupons = [...coupons, ...mockCoupons];
    const coupon = allCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);

    if (!coupon) {
      setCouponError('Invalid or inactive coupon code.');
      setAppliedCoupon(null);
      return;
    }

    const now = new Date();
    if (new Date(coupon.endDate) < now) {
      setCouponError('This coupon has expired.');
      setAppliedCoupon(null);
      return;
    }

    if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
      setCouponError(`Minimum purchase of $${coupon.minPurchaseAmount} required.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCode('');
  };

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (cartTotal * appliedCoupon.discountValue) / 100;
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, cartTotal]);

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxes = (cartTotal - discountAmount) * TAX_RATE;
  const finalTotal = Math.max(0, cartTotal - discountAmount + shipping + taxes);

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

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

        {/* Recommended in Empty Cart */}
        <div className="mt-32">
          <h3 className="text-3xl font-serif mb-12">You may also like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendedItems.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="group text-left space-y-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold/60">{p.brand}</span>
                  <h4 className="font-serif text-lg group-hover:text-brand-gold transition-colors">{p.name}</h4>
                  <Price amount={p.price} className="text-sm font-medium" />
                </div>
              </Link>
            ))}
          </div>
        </div>
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

        {/* Urgency Trigger */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-brand-gold/5 border border-brand-gold/10 rounded-2xl p-4 mb-8 flex items-center space-x-3"
        >
          <AlertCircle size={20} className="text-brand-gold" />
          <p className="text-sm font-medium text-brand-gold">Items in your bag are selling fast. Limited stock available!</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* LEFT SECTION — CART ITEMS (70%) */}
          <div className="lg:w-[70%] space-y-6">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={`${item.id}-${item.selectedSize}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-brand-dark/5 flex flex-col sm:flex-row gap-6 group relative"
                >
                  {/* Product Image */}
                  <Link to={`/product/${item.id}`} className="block w-24 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0 bg-brand-cream mx-auto sm:mx-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </Link>
                  
                  {/* Product Details */}
                  <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                        <div className="w-full sm:w-auto">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-0.5 sm:mb-1 block">{item.brand}</span>
                          <h3 className="text-base sm:text-xl font-serif hover:text-brand-gold transition-colors truncate sm:whitespace-normal">
                            <Link to={`/product/${item.id}`}>{item.name}</Link>
                          </h3>
                          
                          {/* Size and Quantity */}
                          <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                            <div className="relative inline-block">
                              <select 
                                value={item.selectedSize}
                                onChange={(e) => updateSize(item.id, item.selectedSize, e.target.value)}
                                className="appearance-none bg-brand-cream/50 border border-brand-dark/5 rounded-lg pl-2 sm:pl-3 pr-7 sm:pr-8 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-brand-gold cursor-pointer"
                              >
                                {item.sizes.map(size => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-brand-dark/40" />
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center bg-brand-cream/50 border border-brand-dark/5 rounded-lg p-0.5 sm:p-1">
                              <button 
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                className="p-1 hover:text-brand-gold transition-colors"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="w-5 sm:w-6 text-center text-[9px] sm:text-[10px] font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                className="p-1 hover:text-brand-gold transition-colors"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-dark/5">
                          <Price 
                            amount={(item.price + (item.discount || 0)) * item.quantity} 
                            discount={(item.discount || 0) * item.quantity} 
                            productId={item.id}
                            className="text-base sm:text-xl font-bold text-brand-dark" 
                          />
                          {item.quantity > 1 && (
                            <p className="text-[9px] sm:text-[10px] text-brand-dark/40 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                              <Price amount={item.price + (item.discount || 0)} discount={item.discount} productId={item.id} /> each
                            </p>
                          )}
                        </div>
                      </div>

                      {/* UX Enhancements */}
                      <div className="flex flex-wrap gap-3 sm:gap-4 pt-1 sm:pt-2">
                        <div className="flex items-center space-x-1 sm:space-x-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-orange-600">
                          <AlertCircle size={10} />
                          <span>Only {Math.floor(Math.random() * 5) + 1} left</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                          <Truck size={10} />
                          <span>Delivers in 3–5 days</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4 sm:space-x-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-brand-dark/5">
                      <button 
                        onClick={() => toggleWishlist(item)}
                        className={`flex items-center space-x-1.5 sm:space-x-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors ${isInWishlist(item.id) ? 'text-brand-gold' : 'text-brand-dark/40 hover:text-brand-gold'}`}
                      >
                        <Heart size={12} fill={isInWishlist(item.id) ? 'currentColor' : 'none'} />
                        <span>{isInWishlist(item.id) ? 'Saved' : 'Save'}</span>
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                        className="flex items-center space-x-1.5 sm:space-x-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Smart Upsell Section */}
            <div className="pt-12">
              <h3 className="text-2xl font-serif mb-8">Complete the look</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {recommendedItems.map((p) => (
                  <Link key={p.id} to={`/product/${p.id}`} className="group space-y-3">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-all">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif truncate">{p.name}</h4>
                      <Price amount={p.price} className="text-xs font-bold text-brand-dark/60" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION — ORDER SUMMARY (30%) */}
          <div className="lg:w-[30%]">
            <div className="sticky top-32 space-y-6">
              {/* Free Shipping Threshold */}
              {amountToFreeShipping > 0 ? (
                <div className="bg-white p-6 rounded-2xl border border-brand-gold/20 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Free Shipping</span>
                    <span className="text-xs font-bold text-brand-gold"><Price amount={amountToFreeShipping} /> more</span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-cream rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(cartTotal / FREE_SHIPPING_THRESHOLD) * 100}%` }}
                      className="h-full bg-brand-gold"
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mt-3">
                    Add <Price amount={amountToFreeShipping} /> more to get <span className="text-brand-gold">FREE shipping</span>
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <Check size={18} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">You've unlocked FREE shipping!</p>
                </div>
              )}

              {/* Order Summary Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-dark/5 space-y-8">
                <h2 className="text-2xl font-serif">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-dark/60 font-medium">Subtotal</span>
                    <Price amount={cartTotal} className="font-bold" />
                  </div>
                  
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

                  <div className="flex justify-between text-sm">
                    <span className="text-brand-dark/60 font-medium">Estimated Tax</span>
                    <Price amount={taxes} className="font-bold" />
                  </div>

                  <div className="pt-6 border-t border-brand-dark/5 flex justify-between items-end">
                    <div>
                      <span className="text-lg font-serif block">Total</span>
                      <span className="text-[10px] text-brand-dark/40 font-bold uppercase tracking-widest">Including VAT</span>
                    </div>
                    <Price amount={finalTotal} className="text-3xl font-bold text-brand-gold" />
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
                          className="flex-grow bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          className="bg-brand-dark text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-2 text-rose-500 text-[10px] font-bold uppercase tracking-widest"
                        >
                          <AlertCircle size={14} />
                          <span>{couponError}</span>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-100"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">{appliedCoupon.code}</span>
                          <p className="text-[10px] text-emerald-600">Code applied – You saved <Price amount={discountAmount} /></p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setAppliedCoupon(null)}
                        className="text-emerald-700 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Checkout Button */}
                <div className="space-y-4">
                  <p className="text-[10px] text-center font-bold uppercase tracking-widest text-brand-dark/40">You're almost there</p>
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-brand-gold to-brand-gold text-white py-5 rounded-full font-bold uppercase tracking-widest hover:shadow-xl hover:shadow-brand-gold/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={20} />
                  </button>
                  <Link 
                    to="/shop"
                    className="w-full flex items-center justify-center py-3 text-xs font-bold uppercase tracking-widest text-brand-dark/60 hover:text-brand-gold transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Trust Signals */}
                <div className="pt-8 border-t border-brand-dark/5 space-y-6">
                  <div className="flex items-center justify-center space-x-2 text-brand-dark/60">
                    <Lock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
                  </div>
                  
                  <div className="flex justify-center items-center gap-4 opacity-40 grayscale">
                    <CreditCard size={20} />
                    <Apple size={20} />
                    <div className="text-[10px] font-black italic">VISA</div>
                    <div className="text-[10px] font-black italic">mada</div>
                  </div>

                  <p className="text-[10px] text-center text-brand-dark/40 font-bold uppercase tracking-widest">
                    Trusted by 10,000+ customers
                  </p>
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
