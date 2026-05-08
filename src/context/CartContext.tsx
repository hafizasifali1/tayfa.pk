import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CartService, CartItem, buildVariantId, getOrCreateSessionId } from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  addToCart: (product: any, attributes?: Record<string, string>, qty?: number) => Promise<void>;
  removeFromCart: (productId: string, variantId: string, cartItemId?: string) => Promise<void>;
  updateQuantity: (productId: string, variantId: string, qty: number, cartItemId?: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  groupBySeller: () => Record<string, CartItem[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Serialization lock: prevents concurrent cart mutations ──────
  const operationLock = useRef<Promise<void>>(Promise.resolve());

  const withLock = useCallback(<T,>(op: () => Promise<T>): Promise<T> => {
    const next = operationLock.current.then(op);
    // silence rejections on the lock chain so future ops can still run
    operationLock.current = next.then(() => {}, () => {});
    return next;
  }, []);

  // ── Single initialization effect — no competing effects ─────────
  const prevUserIdRef = useRef<string | undefined>(undefined);
  const initDoneRef = useRef(false);

  // Refresh each cart item's price from the current product API so stale
  // snapshots (e.g. after a tax-rule change) are corrected on every load.
  const syncCartPrices = async (items: CartItem[]): Promise<CartItem[]> => {
    if (items.length === 0) return items;
    const productIds = [...new Set(items.map(i => i.id))];
    try {
      const results = await Promise.all(
        productIds.map(id =>
          fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null).catch(() => null)
        )
      );
      const priceMap: Record<string, { price: number; originalPrice?: number; taxType?: 'inclusive' | 'exclusive'; taxRate?: number }> = {};
      results.forEach((product: any) => {
        if (!product?.id) return;
        const isExclusive = product.taxType === 'exclusive';
        // Exclusive: display base price; Inclusive: display priceAfterTax
        const displayPrice = isExclusive
          ? parseFloat(String(product.price || 0))
          : parseFloat(String(product.priceAfterTax || product.price || 0));
        const salePrice = product.salePrice ? parseFloat(String(product.salePrice)) : null;
        const taxRate = parseFloat(String(product.taxRate || 0));
        priceMap[product.id] = salePrice
          ? { price: salePrice, originalPrice: displayPrice, taxType: product.taxType, taxRate }
          : { price: displayPrice, originalPrice: undefined, taxType: product.taxType, taxRate };
      });
      return items.map(item => {
        const current = priceMap[item.id];
        if (!current) return item;
        return { ...item, price: current.price, originalPrice: current.originalPrice, taxType: current.taxType, taxRate: current.taxRate };
      });
    } catch {
      return items;
    }
  };

  const attachPromotions = async (items: CartItem[]): Promise<CartItem[]> => {
    if (items.length === 0) return items;
    return Promise.all(
      items.map(async (item) => {
        try {
          const res = await fetch(`/api/promotions?product_id=${item.id}&status=active`);
          const data = await res.json();
          const promos = Array.isArray(data) ? data : (data.promotions || data.data || []);
          return { ...item, applicablePromotions: promos };
        } catch {
          return { ...item, applicablePromotions: [] };
        }
      })
    );
  };

  useEffect(() => {
    let cancelled = false;
    getOrCreateSessionId();

    const init = async () => {
      const currentUserId = user?.id;
      const wasLoggedIn = prevUserIdRef.current;

      setIsLoading(true);
      try {
        let items: CartItem[];

        if (currentUserId) {
          if (!wasLoggedIn) {
            items = await CartService.onLogin(currentUserId);
          } else {
            items = await CartService.DbCart.getAll(currentUserId);
          }
        } else {
          items = CartService.LocalCart.getAll();
        }

        if (!cancelled) {
          const syncedItems = await syncCartPrices(items);
          const itemsWithPromos = await attachPromotions(syncedItems);
          setCart(itemsWithPromos);
          prevUserIdRef.current = currentUserId;
          initDoneRef.current = true;
        }
      } catch (err) {
        console.error('[CartContext] Init error:', err);
        if (!cancelled) {
          const freshGuest = await syncCartPrices(CartService.LocalCart.getAll());
          setCart(await attachPromotions(freshGuest));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Public refreshCart ───────────────────────────────────────────
  const refreshCart = useCallback(async () => {
    await withLock(async () => {
      setIsLoading(true);
      try {
        const items = await CartService.getCart(user?.id);
        const syncedItems = await syncCartPrices(items);
        const withPromos = await attachPromotions(syncedItems);
        setCart(withPromos);
      } finally {
        setIsLoading(false);
      }
    });
  }, [user?.id, withLock]);

  // ── Add to Cart ──────────────────────────────────────────────────
  const addToCart = useCallback(async (product: any, attributes?: Record<string, string>, qty: number = 1) => {
    getOrCreateSessionId();
    const variantId = buildVariantId(attributes);

    let image = '';
    try {
      const imgs = typeof product.images === 'string'
        ? JSON.parse(product.images)
        : product.images;

      if (Array.isArray(imgs)) {
        // Find first image that is NOT base64 (URLs only)
        const urlImage = imgs.find(img => typeof img === 'string' && !img.startsWith('data:image'));
        if (urlImage) image = urlImage;
      } else if (typeof imgs === 'string' && imgs.length > 10 && !imgs.startsWith('data:image')) {
        image = imgs;
      }
    } catch { }

    // Fallback check on singular image property
    if (!image && product.image && typeof product.image === 'string' && !product.image.startsWith('data:image')) {
      image = product.image;
    }

    // FINAL FALLBACK: If image is still empty or is base64, use a placeholder URL
    if (!image || (typeof image === 'string' && image.startsWith('data:image'))) {
      image = 'https://images.unsplash.com/photo-1539109132381-31a1ecdd7ce9?q=80&w=800&auto=format&fit=crop';
    }

    const isExclusive = product.taxType === 'exclusive';
    const displayPrice = isExclusive
      ? parseFloat(String(product.price || 0))
      : parseFloat(String(product.priceAfterTax || product.price || 0));
    const salePrice = product.salePrice ? parseFloat(String(product.salePrice)) : null;
    const taxRate = parseFloat(String(product.taxRate || 0));

    const item: Omit<CartItem, 'cartItemId' | 'cartId'> = {
      id: product.id,
      sellerId: product.sellerId || '',
      name: product.name,
      price: salePrice || displayPrice,
      originalPrice: salePrice ? displayPrice : undefined,
      imageUrl: image,
      qty,
      variantId,
      attributes: attributes || {},
      applicablePromotions: product.applicablePromotions,
      taxType: product.taxType,
      taxRate,
    };

    await withLock(async () => {
      try {
        const updated = await CartService.addItem(item, user?.id);
        const withPromos = await attachPromotions(updated);
        setCart(withPromos);
      } catch (err) {
        console.error("Failed to add to cart:", err);
      }
    });
  }, [user?.id, withLock]);

  // ── Remove from Cart ─────────────────────────────────────────────
  const removeFromCart = useCallback(async (
    productId: string,
    variantId: string,
    cartItemId?: string
  ) => {
    await withLock(async () => {
      try {
        const updated = await CartService.removeItem(productId, variantId, user?.id, cartItemId);
        const withPromos = await attachPromotions(updated);
        setCart(withPromos);
      } catch (err) {
        console.error("Failed to remove from cart:", err);
      }
    });
  }, [user?.id, withLock]);

  // ── Update Quantity ──────────────────────────────────────────────
  const updateQuantity = useCallback(async (
    productId: string,
    variantId: string,
    qty: number,
    cartItemId?: string
  ) => {
    // Optimistic update for instant UI response
    setCart(prev => {
      if (qty < 1) return prev.filter(i => !(i.id === productId && i.variantId === variantId));
      return prev.map(i =>
        i.id === productId && i.variantId === variantId ? { ...i, qty } : i
      );
    });

    await withLock(async () => {
      try {
        const updated = await CartService.updateQty(productId, variantId, qty, user?.id, cartItemId);
        const withPromos = await attachPromotions(updated);
        setCart(withPromos);
      } catch (err) {
        console.error("Failed to update cart qty:", err);
        // Rollback on failure
        const fresh = await CartService.getCart(user?.id);
        const freshWithPromos = await attachPromotions(fresh);
        setCart(freshWithPromos);
      }
    });
  }, [user?.id, withLock]);

  // ── Clear Cart ───────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    CartService.LocalCart.clear(user?.id);
    setCart([]);
  }, [user?.id]);

  // ── Group by Seller ──────────────────────────────────────────────
  const groupBySeller = useCallback(() => {
    return CartService.groupBySeller(cart);
  }, [cart]);

  const cartCount = CartService.totalCount(cart);
  const cartTotal = CartService.totalPrice(cart);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartTotal,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart,
      groupBySeller,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
