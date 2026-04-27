import { Product, Promotion, CartItem } from '../types';

export const calculatePromotionDiscount = (product: Product | CartItem, quantity: number) => {
  const promos = product.applicablePromotions || [];
  if (promos.length === 0) return null;

  const applicable = promos.filter(p => {
    // For buy_x_get_y_free, use buyQuantity
    if (p.type === 'buy_x_get_y_free') {
      return quantity >= (p.buyQuantity || 1);
    }
    // For percentage, fixed_amount, free_shipping — use minQuantity
    return quantity >= (p.minQuantity || 1);
  });

  if (applicable.length === 0) return null;

  // Best one based on total savings
  return applicable.reduce((best, curr) => {
    const bestSavings = getSavings(product.price, best, quantity);
    const currSavings = getSavings(product.price, curr, quantity);
    return currSavings > bestSavings ? curr : best;
  });
};

export const getSavings = (price: number, promo: Promotion, qty: number) => {
  if (promo.type === 'percentage') {
    return price * qty * (promo.value / 100);
  } else if (promo.type === 'fixed_amount') {
    return promo.value * qty;
  }
  return 0;
};

export const formatPromotionLabel = (promo: Promotion) => {
  if (promo.type === 'percentage') {
    return `${promo.value}% OFF`;
  } else if (promo.type === 'fixed_amount') {
    return `PKR ${promo.value} OFF`;
  } else if (promo.type === 'free_shipping') {
    return 'Free Shipping';
  } else if (promo.type === 'buy_x_get_y_free') {
    return `Buy ${promo.buyQuantity} Get ${promo.getQuantity} Free`;
  }
  return 'Special Offer';
};



export const checkPromotionStatus = (item: CartItem) => {
  const promos = item.applicablePromotions || [];
  if (promos.length === 0) return null;

  // Include all promos that have a meaningful quantity threshold
  const volumePromos = promos.filter(p => {
    if (p.type === 'buy_x_get_y_free') return (p.buyQuantity || 0) > 1;
    return (p.minQuantity || 1) > 1;
  });
  if (volumePromos.length === 0) return null;

  // Pick the promo the user is closest to (applied or almost)
  const bestPromo = volumePromos.reduce((prev, curr) => {
    const prevMin = prev.type === 'buy_x_get_y_free' ? (prev.buyQuantity || 1) : (prev.minQuantity || 1);
    const currMin = curr.type === 'buy_x_get_y_free' ? (curr.buyQuantity || 1) : (curr.minQuantity || 1);
    return Math.abs(item.qty - currMin) < Math.abs(item.qty - prevMin) ? curr : prev;
  });

  const minQty = bestPromo.type === 'buy_x_get_y_free'
    ? (bestPromo.buyQuantity || 1)
    : (bestPromo.minQuantity || 1);

  if (item.qty >= minQty) {
    return {
      status: 'applied',
      promotion: bestPromo,
      savings: getSavings(item.price, bestPromo, item.qty)
    };
  } else if (item.qty === minQty - 1) {
    return {
      status: 'almost',
      promotion: bestPromo,
      remaining: 1,
      progress: (item.qty / minQty) * 100
    };
  }

  return null;
};
