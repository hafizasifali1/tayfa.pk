/**
 * CartService — Unified cart operations for both guest & logged-in users.
 * Guest  → localStorage  (key: 'tayfa_guest_cart')
 * Logged → Database via API (/api/cart)
 * Fallback: if API fails, silently falls back to localStorage.
 */

import axios from 'axios';

// ---------- Types ----------
export interface CartVariant {
  size?: string;
  color?: string;
}

export interface CartItem {
  id: string;            // product ID
  cartItemId?: string;   // DB cart_item row ID (only for logged-in)
  cartId?: string;
  sellerId: string;
  name: string;
  price: number;        // Final price to be paid
  originalPrice?: number; // Price before discount
  imageUrl: string;
  qty: number;
  variantId: string;    // encodes all selected attribute values e.g. "Green-Cotton"
  attributes?: Record<string, string>; // { "Color": "Green", "Fabric": "Cotton" }
  applicablePromotions?: any[];
}

// ---------- Session ID for guests ----------
// ---------- Keys ----------
const getCartKey = (userId?: string) => userId ? `tayfa_cart_${userId}` : 'tayfa_guest_cart';
const GUEST_CART_KEY = 'tayfa_guest_cart';
const GUEST_SESSION_KEY = 'tayfa_guest_session';

export const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(GUEST_SESSION_KEY);
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const buildVariantId = (attributes?: Record<string, string>): string => {
  if (!attributes || Object.keys(attributes).length === 0) return 'default';
  const parts = Object.values(attributes).filter(Boolean);
  return parts.length > 0 ? parts.join('-') : 'default';
};

// ============================================================
// LOCAL CART — localStorage (Multi-user support)
// ============================================================
const LocalCart = {
  getAll(userId?: string): CartItem[] {
    try {
      const key = getCartKey(userId);
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      
      if (Array.isArray(parsed)) {
        return parsed.map((it: any) => ({
          ...it,
          imageUrl: it.imageUrl || it.image || '',
        }));
      }

      // ── Migration logic only for legacy guest cart ──────────────────────────
      if (!userId) {
        const oldRaw = localStorage.getItem('cart');
        if (oldRaw) {
          const oldItems = JSON.parse(oldRaw);
          if (Array.isArray(oldItems) && oldItems.length > 0) {
            const migrated: CartItem[] = oldItems.map((old: any) => ({
              id: old.id,
              sellerId: old.sellerId || '',
              name: old.name,
              price: parseFloat(String(old.price)) || 0,
              imageUrl: (() => {
                try {
                  const imgs = typeof old.images === 'string' ? JSON.parse(old.images) : old.images;
                  return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : '';
                } catch { return ''; }
              })(),
              qty: old.quantity || old.qty || 1,
              variantId: buildVariantId({ ...(old.selectedSize ? { Size: old.selectedSize } : {}), ...(old.selectedColor ? { Color: old.selectedColor } : {}) }),
              attributes: { ...(old.selectedSize ? { Size: old.selectedSize } : {}), ...(old.selectedColor ? { Color: old.selectedColor } : {}) },
            }));
            localStorage.setItem(key, JSON.stringify(migrated));
            localStorage.removeItem('cart');
            return migrated;
          }
          localStorage.removeItem('cart');
        }
      }
      
      return [];
    } catch {
      return [];
    }
  },

  save(items: CartItem[], userId?: string): void {
    const key = getCartKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
  },

  add(item: Omit<CartItem, 'cartItemId' | 'cartId'>, userId?: string): CartItem[] {
    const items = LocalCart.getAll(userId);
    const existingIndex = items.findIndex(
      (i) => i.id === item.id && i.variantId === item.variantId
    );
    
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex] = { 
        ...updated[existingIndex], 
        qty: updated[existingIndex].qty + item.qty 
      };
    } else {
      updated = [...items, item as CartItem];
    }
    
    LocalCart.save(updated, userId);
    return updated;
  },

  remove(productId: string, variantId: string, userId?: string): CartItem[] {
    const updated = LocalCart.getAll(userId).filter(
      (i) => !(i.id === productId && i.variantId === variantId)
    );
    LocalCart.save(updated, userId);
    return updated;
  },

  updateQty(productId: string, variantId: string, qty: number, userId?: string): CartItem[] {
    if (qty < 1) return LocalCart.remove(productId, variantId, userId);
    const updated = LocalCart.getAll(userId).map((i) =>
      i.id === productId && i.variantId === variantId ? { ...i, qty } : i
    );
    LocalCart.save(updated, userId);
    return updated;
  },

  clear(userId?: string): void {
    localStorage.removeItem(getCartKey(userId));
    if (userId) {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  },
};

// ============================================================
// LOGGED-IN USER CART — Database via API
// ============================================================
const DbCart = {
  async getAll(userId: string): Promise<CartItem[]> {
    try {
      if (!userId) return [];
      const res = await axios.get(`/api/cart?userId=${userId}`);
      const items = Array.isArray(res.data.items) ? res.data.items : [];
      // Synchronize local storage with DB results
      LocalCart.save(items, userId);
      return items;
    } catch (err) {
      console.error('[DbCart] Failed to get user cart:', err);
      // Fallback to local storage if DB is unreachable
      return LocalCart.getAll(userId);
    }
  },

  async add(userId: string, item: Omit<CartItem, 'cartItemId' | 'cartId'>): Promise<CartItem[]> {
    // 1. Update Local first
    const local = LocalCart.add(item, userId);
    
    try {
      const res = await axios.post('/api/cart/items', { userId, ...item });
      const items = Array.isArray(res.data.items) ? res.data.items : [];
      LocalCart.save(items, userId);
      return items;
    } catch (err) {
      console.error('[DbCart] Failed to add item:', err);
      return local; 
    }
  },

  async remove(cartItemId: string, userId: string, productId: string, variantId: string): Promise<CartItem[]> {
    const local = LocalCart.remove(productId, variantId, userId);
    
    try {
      const res = await axios.delete(`/api/cart/items/${cartItemId}?userId=${userId}`);
      const items = Array.isArray(res.data.items) ? res.data.items : [];
      LocalCart.save(items, userId);
      return items;
    } catch (err) {
      console.error('[DbCart] Failed to remove item:', err);
      return local;
    }
  },

  async updateQty(cartItemId: string, userId: string, qty: number, productId: string, variantId: string): Promise<CartItem[]> {
    const local = LocalCart.updateQty(productId, variantId, qty, userId);
    
    try {
      const res = await axios.put(`/api/cart/items/${cartItemId}`, { userId, qty });
      const items = Array.isArray(res.data.items) ? res.data.items : [];
      LocalCart.save(items, userId);
      return items;
    } catch (err) {
      console.error('[DbCart] Failed to update qty:', err);
      return local;
    }
  },

  async mergeGuestCart(userId: string): Promise<CartItem[]> {
    // When merging, we use the GUEST key explicitly
    const rawGuest = localStorage.getItem(GUEST_CART_KEY);
    const guestItems: CartItem[] = rawGuest ? JSON.parse(rawGuest) : [];
    
    try {
      if (guestItems.length > 0) {
        const res = await axios.post('/api/cart/merge', { userId, guestItems });
        const mergedItems = Array.isArray(res.data.items) ? res.data.items : [];
        
        LocalCart.save(mergedItems, userId);
        // Clear the guest cart after successful merge to avoid double merging on future refreshes
        localStorage.removeItem(GUEST_CART_KEY);
        return mergedItems;
      }
      
      return DbCart.getAll(userId);
    } catch (err) {
      console.error('[DbCart] Merge failed:', err);
      return DbCart.getAll(userId);
    }
  },
};

// ============================================================
// PUBLIC API — used by CartContext
// ============================================================
export const CartService = {
  LocalCart,
  DbCart,

  async getCart(userId?: string): Promise<CartItem[]> {
    if (userId) return DbCart.getAll(userId);
    return LocalCart.getAll();
  },

  async addItem(
    item: Omit<CartItem, 'cartItemId' | 'cartId'>,
    userId?: string
  ): Promise<CartItem[]> {
    if (userId) return DbCart.add(userId, item);
    return LocalCart.add(item);
  },

  async removeItem(
    productId: string,
    variantId: string,
    userId?: string,
    cartItemId?: string
  ): Promise<CartItem[]> {
    if (userId && cartItemId) return DbCart.remove(cartItemId, userId, productId, variantId);
    return LocalCart.remove(productId, variantId, userId);
  },

  async updateQty(
    productId: string,
    variantId: string,
    qty: number,
    userId?: string,
    cartItemId?: string
  ): Promise<CartItem[]> {
    if (userId && cartItemId) return DbCart.updateQty(cartItemId, userId, qty, productId, variantId);
    return LocalCart.updateQty(productId, variantId, qty, userId);
  },

  async onLogin(userId: string): Promise<CartItem[]> {
    return DbCart.mergeGuestCart(userId);
  },

  totalCount(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.qty, 0);
  },

  totalPrice(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  /** Group items by seller for multi-seller checkout routing */
  groupBySeller(items: CartItem[]): Record<string, CartItem[]> {
    return items.reduce((acc, item) => {
      const key = item.sellerId || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  },
};
