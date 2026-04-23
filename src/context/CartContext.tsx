import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CartService, CartItem, buildVariantId, getOrCreateSessionId } from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  addToCart: (product: any, size?: string, color?: string) => Promise<void>;
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
          items = CartService.GuestCart.getAll();
        }

        if (!cancelled) {
          setCart(items);
          prevUserIdRef.current = currentUserId;
          initDoneRef.current = true;
        }
      } catch (err) {
        console.error('[CartContext] Init error:', err);
        if (!cancelled) {
          setCart(CartService.GuestCart.getAll());
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
        setCart(items);
      } finally {
        setIsLoading(false);
      }
    });
  }, [user?.id, withLock]);

  // ── Add to Cart ──────────────────────────────────────────────────
  const addToCart = useCallback(async (product: any, size?: string, color?: string) => {
    getOrCreateSessionId();
    let variantId = buildVariantId(size, color);
    
    // Safety check for empty sizes if selected size wasn't passed properly
    if (variantId === 'default') {
      const defaultSize = Array.isArray(product.sizes) && product.sizes.length > 0 
        ? product.sizes[0] 
        : undefined;
      if (defaultSize) variantId = buildVariantId(defaultSize, color);
    }

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

    const item: Omit<CartItem, 'cartItemId' | 'cartId'> = {
      id: product.id,
      sellerId: product.sellerId || '',
      name: product.name,
      price: parseFloat(String(product.price)) || 0,
      imageUrl: image,
      qty: 1,
      variantId,
      size,
      color,
    };

    await withLock(async () => {
      try {
        const updated = await CartService.addItem(item, user?.id);
        setCart(updated);
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
        setCart(updated);
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
        setCart(updated);
      } catch (err) {
        console.error("Failed to update cart qty:", err);
        // Rollback on failure
        const fresh = await CartService.getCart(user?.id);
        setCart(fresh);
      }
    });
  }, [user?.id, withLock]);

  // ── Clear Cart ───────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    CartService.GuestCart.clear();
    setCart([]);
  }, []);

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
