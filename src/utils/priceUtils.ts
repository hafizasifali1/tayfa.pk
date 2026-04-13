import { Product, Pricelist, Promotion } from '../types';

export const calculateFinalPrice = (product: Product, selectedCountry?: { currency: string } | null): number => {
  let currentPrice = product.price;

  // 1. Check active pricelists
  let pricelists: Pricelist[] = [];
  try {
    const stored = localStorage.getItem('tayfa_pricelists');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        pricelists = parsed;
      }
    }
  } catch (e) {
    console.error('Error parsing pricelists in priceUtils:', e);
  }
  
  // Find a pricelist that is active and matches the selected country's currency
  const activePricelist = Array.isArray(pricelists) ? pricelists.find(pl => 
    pl.isActive && 
    (pl.currency === selectedCountry?.currency || pl.currency === 'USD')
  ) : null;

  if (activePricelist && Array.isArray(activePricelist.items)) {
    const item = activePricelist.items.find(i => i.productId === product.id);
    if (item) {
      currentPrice = item.price;
    }
  }

  // 2. Check active promotions
  let promotions: Promotion[] = [];
  try {
    const stored = localStorage.getItem('tayfa_promotions');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        promotions = parsed;
      }
    }
  } catch (e) {
    console.error('Error parsing promotions in priceUtils:', e);
  }
  
  // Filter active promotions that apply to this product (simplified)
  const activePromotions = Array.isArray(promotions) ? promotions.filter(p => p.isActive) : [];
  
  activePromotions.forEach(promo => {
    if (promo.type === 'percentage') {
      currentPrice = currentPrice * (1 - promo.value / 100);
    } else if (promo.type === 'fixed_amount') {
      currentPrice = Math.max(0, currentPrice - promo.value);
    }
  });

  return currentPrice;
};
