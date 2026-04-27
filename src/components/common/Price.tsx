import React, { useMemo } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { Pricelist, Promotion, Discount } from '../../types';

interface PriceProps {
  amount: number; 
  discount?: number; 
  productId?: string;
  className?: string;
  showLocalMessage?: boolean;
  currency?: string;
}

const Price: React.FC<PriceProps> = ({ amount, discount = 0, productId, className = "", showLocalMessage = false, currency }) => {
  const { formatPrice, selectedCountry, exchangeRates, isLoading } = useCurrency();

  const finalAmount = useMemo(() => {
    let currentPriceUSD = amount - discount;
    if (!productId || !selectedCountry) return currentPriceUSD;

    let discounts: Discount[] = [];
    try {
      const stored = localStorage.getItem('tayfa_discounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) discounts = parsed;
      }
    } catch (e) {}

    const activeDiscount = discounts.find(d => d.productId === productId && d.isActive);
    if (activeDiscount) {
      currentPriceUSD = currentPriceUSD * (1 - activeDiscount.percentage / 100);
    }

    let pricelists: Pricelist[] = [];
    try {
      const stored = localStorage.getItem('tayfa_pricelists');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) pricelists = parsed;
      }
    } catch (e) {}

    const activePricelist = pricelists.find(pl => pl.isActive && pl.currency === selectedCountry.currency);
    if (activePricelist) {
      const item = activePricelist.items.find(i => i.productId === productId);
      if (item) {
        const rate = exchangeRates[selectedCountry.currency] || 1;
        currentPriceUSD = item.price / rate;
      }
    }

    // 3. Check for active Promotions
    let promotions: Promotion[] = [];
    try {
      const stored = localStorage.getItem('tayfa_promotions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) promotions = parsed;
      }
    } catch (e) {}

    // Filter promotions that are active and apply to this product
    const applicablePromotions = promotions.filter(p => 
      p.isActive && 
      (p.applicableProducts.length === 0 || p.applicableProducts.includes(productId))
    );

    if (applicablePromotions.length > 0) {
      // Apply the first applicable promotion
      const promo = applicablePromotions[0];
      if (promo.type === 'percentage') {
        currentPriceUSD = currentPriceUSD * (1 - promo.value / 100);
      } else if (promo.type === 'fixed_amount') {
        currentPriceUSD = Math.max(0, currentPriceUSD - promo.value);
      }
    }

    return currentPriceUSD;
  }, [amount, discount, productId, selectedCountry, exchangeRates, currency]);

  const discountPercentage = useMemo(() => {
    if (finalAmount >= amount) return 0;
    return Math.round(((amount - finalAmount) / amount) * 100);
  }, [amount, finalAmount]);

  if (isLoading && !selectedCountry && !currency) {
    return <span className={`animate-pulse bg-brand-dark/5 rounded h-5 w-16 inline-block ${className}`}></span>;
  }

  return (
    <span className="inline-flex flex-col">
      <span className="flex items-center flex-wrap gap-x-2">
        <span className={`${className} text-brand-dark font-bold`}>
          {formatPrice(finalAmount, currency)}
        </span>
        {finalAmount < amount && (
          <>
            <span className="text-xs text-brand-dark-muted line-through font-medium">
              {formatPrice(amount, currency)}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
              -{discountPercentage}%
            </span>
          </>
        )}
      </span>
      {showLocalMessage && selectedCountry && !currency && (
        <span className="text-[10px] text-brand-dark-muted italic mt-0.5 font-medium">
          {/* Prices are shown in your local currency ({selectedCountry.currency}) */}
        </span>
      )}
    </span>
  );
};

export default Price;
