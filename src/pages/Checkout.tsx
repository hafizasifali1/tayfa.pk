import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Lock, 
  ChevronRight,
  AlertCircle,
  Loader2,
  Package,
  MapPin,
  Building2,
  Phone,
  Mail,
  User,
  Banknote,
  Wallet,
  Info,
  Tag,
  Trash2,
  Sparkles
} from 'lucide-react';
import { calculatePromotionDiscount, formatPromotionLabel, getSavings } from '../utils/promotionUtils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuthModal } from '../context/AuthModalContext';
import Price from '../components/common/Price';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PaymentMethod } from '../types';
import axios from 'axios';

import PaymentSelection from '../components/checkout/PaymentSelection';
import CountrySelector from '../components/common/CountrySelector';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { selectedCountry, convertPrice } = useCurrency();
  const navigate = useNavigate();
  const { openModal } = useAuthModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCouponSuccess, setIsCouponSuccess] = useState(false);

  // Constants
  const FREE_SHIPPING_THRESHOLD = 200;
  const SHIPPING_COST = 15;
  const TAX_RATE = 0.08;

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
          subtotal: cartTotal
        })
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue
        });
        setIsCouponSuccess(true);
        setCouponCode('');
        setTimeout(() => setIsCouponSuccess(false), 3000);
      } else {
        setCouponError(data.message + (data.details ? `: ${data.details}` : ''));
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError('Failed to validate coupon.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const autoPromoDiscount = React.useMemo(() => {
    return cart.reduce((total, item) => {
      const bestPromo = calculatePromotionDiscount(item as any, item.qty);
      if (bestPromo) {
        return total + getSavings(item.price, bestPromo as any, item.qty);
      }
      return total;
    }, 0);
  }, [cart]);

  const discountAmount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return ((cartTotal - autoPromoDiscount) * appliedCoupon.discountValue) / 100;
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, cartTotal, autoPromoDiscount]);

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxes = (cartTotal - autoPromoDiscount - discountAmount) * TAX_RATE;
  const finalTotal = Math.max(0, cartTotal - autoPromoDiscount - discountAmount + shipping + taxes);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: user?.phone || '',
    countryCode: selectedCountry?.code || '',
  });

  // Update countryCode when selectedCountry changes in context
  React.useEffect(() => {
    if (selectedCountry) {
      setFormData(prev => ({ 
        ...prev, 
        countryCode: selectedCountry.code,
        currency: selectedCountry.currency 
      }));
    }
  }, [selectedCountry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = async () => {
    if (!validateShipping()) return;
    setStep(2);
  };

  const handlePaymentInitiated = (result: any) => {
    setPaymentResult(result);
    if (result.redirectUrl && result.redirectUrl !== '#') {
      // In a real app, you'd redirect to Stripe/PayPal
      window.location.href = result.redirectUrl;
    } else {
      setStep(3);
    }
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      openModal('signin');
      return;
    }
    setIsSubmitting(true);
    try {
      // Skip client-side stock check (server handles it during order creation)

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          totalAmount: finalTotal,
          discountAmount: discountAmount + autoPromoDiscount,
          autoPromoDiscount,
          couponCode: appliedCoupon?.code,
          customerId: user?.id,
          shippingAddress: formData,
          customerEmail: formData.email,
          paymentMethod: paymentResult?.gatewayCode || 'cod',
          notes: 'Order placed via website checkout'
        })
      });

      if (!response.ok) throw new Error('Failed to create order');

      // Simulate some processing time for a premium feel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif mb-4">Your bag is empty</h2>
        <Link to="/shop" className="text-brand-gold hover:underline">Return to Shop</Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-serif">Order Confirmed!</h1>
          <p className="text-brand-dark/60">
            Thank you for your purchase. We've sent a confirmation email to <span className="font-bold text-brand-dark">{formData.email}</span>.
          </p>
          <div className="bg-brand-cream/30 p-6 rounded-2xl border border-brand-dark/5 text-left space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-brand-dark/40 uppercase tracking-widest font-bold text-[10px]">Order Number</span>
              <span className="font-mono font-bold">#ORD-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-dark/40 uppercase tracking-widest font-bold text-[10px]">Estimated Delivery</span>
              <span className="font-bold">3-5 Business Days</span>
            </div>
          </div>
          <div className="pt-8 space-y-4">
            <Button 
              onClick={() => navigate('/shop')}
              className="w-full"
              variant="premium"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={() => navigate('/orders')}
              variant="outline"
              className="w-full"
            >
              View Order History
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 lg:pb-12">
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}
          className="flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-sm font-bold uppercase tracking-widest text-brand-dark/60 hover:text-brand-gold transition-colors"
        >
          <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
          <span>{step === 1 ? 'Back' : 'Prev'}</span>
        </button>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                step === i ? 'bg-brand-dark text-white' : 
                step > i ? 'bg-emerald-500 text-white' : 'bg-brand-cream text-brand-dark/40'
              }`}>
                {step > i ? <CheckCircle2 size={12} className="sm:w-3.5 sm:h-3.5" /> : i}
              </div>
              {i < 3 && <div className={`w-4 sm:w-8 h-[1px] ${step > i ? 'bg-emerald-500' : 'bg-brand-cream'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Guest Login Prompt Banner */}
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
              <p className="text-sm font-bold">Sign in to place your order</p>
              <p className="text-[10px] text-white/50 font-medium mt-0.5">
                Sign in first — your cart will be saved and merged automatically.
              </p>
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

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Main Content */}
        <div className="lg:w-2/3 space-y-8 sm:space-y-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-cream rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-gold">
                    <Truck size={18} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-3xl font-serif">Shipping Details</h2>
                    <p className="text-[10px] sm:text-sm text-brand-dark/60">Where should we send your luxury items?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={16} />
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full bg-brand-cream/30 border ${errors.firstName ? 'border-red-500' : 'border-brand-dark/5'} rounded-xl sm:rounded-2xl px-10 sm:px-12 py-3.5 sm:py-4 text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && <p className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={16} />
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full bg-brand-cream/30 border ${errors.lastName ? 'border-red-500' : 'border-brand-dark/5'} rounded-xl sm:rounded-2xl px-10 sm:px-12 py-3.5 sm:py-4 text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && <p className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{errors.lastName}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={16} />
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full bg-brand-cream/30 border ${errors.email ? 'border-red-500' : 'border-brand-dark/5'} rounded-xl sm:rounded-2xl px-10 sm:px-12 py-3.5 sm:py-4 text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{errors.email}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Country</label>
                    <div className="relative">
                      <CountrySelector />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={16} />
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full bg-brand-cream/30 border ${errors.address ? 'border-red-500' : 'border-brand-dark/5'} rounded-xl sm:rounded-2xl px-10 sm:px-12 py-3.5 sm:py-4 text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                        placeholder="123 Luxury Lane"
                      />
                    </div>
                    {errors.address && <p className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{errors.address}</p>}
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">City</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={16} />
                      <input 
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full bg-brand-cream/30 border ${errors.city ? 'border-red-500' : 'border-brand-dark/5'} rounded-xl sm:rounded-2xl px-10 sm:px-12 py-3.5 sm:py-4 text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                        placeholder="New York"
                      />
                    </div>
                    {errors.city && <p className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{errors.city}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">State</label>
                      <input 
                        type="text" 
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full bg-brand-cream/30 border ${errors.state ? 'border-red-500' : 'border-brand-dark/5'} rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                        placeholder="NY"
                      />
                      {errors.state && <p className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{errors.state}</p>}
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">ZIP Code</label>
                      <input 
                        type="text" 
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full bg-brand-cream/30 border ${errors.zipCode ? 'border-red-500' : 'border-brand-dark/5'} rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                        placeholder="10001"
                      />
                      {errors.zipCode && <p className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={16} />
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full bg-brand-cream/30 border ${errors.phone ? 'border-red-500' : 'border-brand-dark/5'} rounded-xl sm:rounded-2xl px-10 sm:px-12 py-3.5 sm:py-4 text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    {errors.phone && <p className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="pt-4 sm:pt-8">
                  <Button 
                    onClick={handleContinueToPayment}
                    className="w-full md:w-auto px-12 py-4 sm:py-6"
                    variant="premium"
                    disabled={isInitializingPayment}
                  >
                    {isInitializingPayment ? (
                      <div className="flex items-center space-x-3">
                        <Loader2 className="animate-spin" size={18} />
                        <span>Initializing...</span>
                      </div>
                    ) : (
                      <span>Continue to Payment</span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}


            {step === 2 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <PaymentSelection 
                  amount={convertPrice(cartTotal)}
                  currency={selectedCountry?.currency || 'USD'}
                  orderId={`ORD-${Date.now()}`}
                  onPaymentInitiated={handlePaymentInitiated}
                  onCancel={() => setStep(1)}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8 sm:space-y-12"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-cream rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-gold">
                    <Package size={18} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-3xl font-serif">Review Order</h2>
                    <p className="text-[10px] sm:text-sm text-brand-dark/60">One last look before we process your order.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                  <Card className="p-5 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold">Shipping To</h3>
                      <button onClick={() => setStep(1)} className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:text-brand-gold transition-colors">Edit</button>
                    </div>
                    <div className="text-xs sm:text-sm space-y-1">
                      <p className="font-bold">{formData.firstName} {formData.lastName}</p>
                      <p className="text-brand-dark/60">{formData.address}</p>
                      <p className="text-brand-dark/60">{formData.city}, {formData.state} {formData.zipCode}</p>
                      <p className="text-brand-dark/60">{formData.phone}</p>
                    </div>
                  </Card>

                  <Card className="p-5 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold">Payment Method</h3>
                      <button onClick={() => setStep(2)} className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:text-brand-gold transition-colors">Edit</button>
                    </div>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-7 sm:w-12 sm:h-8 bg-brand-dark rounded flex items-center justify-center">
                        <CreditCard size={14} className="text-white sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-xs sm:text-sm">
                        <p className="font-bold">{paymentResult?.gatewayName || 'Payment Initiated'}</p>
                        <p className="text-brand-dark/60 truncate max-w-[120px] sm:max-w-none">
                          {paymentResult?.gatewayType === 'cod' ? 'Pay on Delivery' : 'Instant Payment'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold">Items in Order</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.variantId}`} className="flex items-center space-x-3 sm:space-x-4 bg-white/50 p-2 rounded-xl border border-brand-dark/5 sm:border-none sm:p-0">
                        <div className="w-12 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl || (item as any).image || ''} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-xs sm:text-sm font-bold truncate">{item.name}</p>
                          <p className="text-[9px] sm:text-xs text-brand-dark/60">
                            {item.variantId && item.variantId !== 'default' ? `Variant: ${item.variantId} • ` : ''}Qty: {item.qty}
                          </p>
                        </div>
                        <Price 
                          amount={item.price * item.qty}
                          className="text-xs sm:text-sm font-bold whitespace-nowrap" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 sm:pt-8 border-t border-brand-dark/5">
                  <Button 
                    onClick={handleSubmitOrder}
                    className="w-full py-5 sm:py-6 text-base sm:text-lg"
                    variant="premium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-3">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing Order...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Lock size={18} />
                        <span>Place Order • <Price amount={finalTotal} /></span>
                      </div>
                    )}
                  </Button>
                  <p className="text-[9px] sm:text-[10px] text-center text-brand-dark/40 uppercase tracking-widest mt-4 sm:mt-6 px-4">
                    By placing your order, you agree to our terms of service and privacy policy.
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 shadow-sm border border-brand-dark/5 sticky top-32 space-y-6 sm:space-y-8">
            <h2 className="text-xl sm:text-2xl font-serif">Order Summary</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-brand-dark/60 font-medium font-serif">Subtotal</span>
                <Price amount={cartTotal} className="font-bold" />
              </div>
              
              {autoPromoDiscount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-emerald-600 font-medium flex items-center gap-1.5 font-serif">
                    <Sparkles size={12} />
                    Promos & Discounts
                  </span>
                  <span className="text-emerald-600 font-bold">- <Price amount={autoPromoDiscount} /></span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-emerald-600 font-medium flex items-center gap-1.5 font-serif">
                    <Tag size={12} />
                    Discount ({appliedCoupon.code})
                  </span>
                  <span className="text-emerald-600 font-bold">- <Price amount={discountAmount} /></span>
                </div>
              )}

              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-brand-dark/60 font-medium font-serif">Shipping</span>
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
              <div className="pt-3 sm:pt-4 border-t border-brand-dark/5 flex justify-between items-end">
                <span className="text-base sm:text-lg font-serif">Total</span>
                <Price amount={finalTotal} className="text-xl sm:text-2xl font-bold text-brand-gold" />
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2">
              {!appliedCoupon ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Promo Code" 
                      disabled={isApplyingCoupon}
                      className="flex-grow bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-[10px] focus:outline-none focus:border-brand-gold transition-colors disabled:opacity-50 font-bold uppercase tracking-widest"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode}
                      className="bg-brand-dark text-white px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:bg-brand-dark/20 flex items-center justify-center min-w-[70px]"
                    >
                      {isApplyingCoupon ? <Loader2 className="animate-spin" size={12} /> : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-1.5 text-rose-500 text-[9px] font-black uppercase tracking-tighter">
                      <AlertCircle size={12} />
                      <span>{couponError}</span>
                    </motion.div>
                  )}
                  {isCouponSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-1.5 text-emerald-500 text-[9px] font-black uppercase tracking-tighter">
                      <CheckCircle2 size={12} />
                      <span>Coupon Applied!</span>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-brand-gold/5 p-3 rounded-xl border border-brand-gold/10">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                      <Tag size={14} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark/80">{appliedCoupon.code}</span>
                      <p className="text-[9px] text-brand-dark/40 font-bold uppercase tracking-widest">
                        {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : <Price amount={appliedCoupon.discountValue} />} OFF
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setAppliedCoupon(null); setIsCouponSuccess(false); }}
                    className="text-brand-dark/20 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-brand-cream/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-start space-x-2 sm:space-x-3">
              <ShieldCheck className="text-emerald-500 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-[9px] sm:text-[10px] text-brand-dark/60 leading-relaxed uppercase tracking-widest">
                Your data is protected with 256-bit SSL encryption. We never store your full credit card details.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* MOBILE STICKY BOTTOM CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-brand-dark/5 px-4 py-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.12)] backdrop-blur-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex-shrink-0 pr-4 border-r border-brand-dark/5">
            <p className="text-[9px] text-brand-dark/40 font-bold uppercase tracking-widest mb-0.5">Total</p>
            <Price amount={finalTotal} className="text-lg font-bold text-brand-gold" />
          </div>
          <button 
            onClick={() => {
              if (step === 1) handleContinueToPayment();
              else if (step === 2) setStep(3);
              else handleSubmitOrder();
            }}
            disabled={isSubmitting}
            className="flex-grow bg-brand-gold text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-brand-gold/25 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{step === 3 ? 'Place Order' : 'Continue'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
