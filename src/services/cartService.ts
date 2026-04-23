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
  price: number;
  imageUrl: string;
  qty: number;
  variantId: string;    // "M-Red" or "M" or "Red" or "default"
  size?: string;
  color?: string;
}

// ---------- Session ID for guests ----------
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

export const buildVariantId = (size?: string, color?: string): string => {
  const parts = [size, color].filter(Boolean);
  return parts.length > 0 ? parts.join('-') : 'default';
};

// ============================================================
// GUEST CART — localStorage
// ============================================================
const GuestCart = {
  getAll(): CartItem[] {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((it: any) => ({
          ...it,
          imageUrl: it.imageUrl || it.image || '',
        }));
      }

      // ── Migration from old 'cart' key ──────────────────────────
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
            variantId: buildVariantId(old.selectedSize, old.selectedColor),
            size: old.selectedSize,
            color: old.selectedColor,
          }));
          // Save migrated items to new key, remove old key
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(migrated));
          localStorage.removeItem('cart');
          console.log(`[CartService] Migrated ${migrated.length} items from old cart key.`);
          return migrated;
        }
        // Old key exists but empty — clean it up
        localStorage.removeItem('cart');
      }
      return [];
    } catch {
      return [];
    }
  },

  save(items: CartItem[]): void {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  },

  add(item: Omit<CartItem, 'cartItemId' | 'cartId'>): CartItem[] {
    const items = GuestCart.getAll();
    const existing = items.find(
      (i) => i.id === item.id && i.variantId === item.variantId
    );
    let updated: CartItem[];
    if (existing) {
      updated = items.map((i) =>
        i.id === item.id && i.variantId === item.variantId
          ? { ...i, qty: i.qty + item.qty }
          : i
      );
    } else {
      updated = [...items, item];
    }
    GuestCart.save(updated);
    return updated;
  },

  remove(productId: string, variantId: string): CartItem[] {
    const updated = GuestCart.getAll().filter(
      (i) => !(i.id === productId && i.variantId === variantId)
    );
    GuestCart.save(updated);
    return updated;
  },

  updateQty(productId: string, variantId: string, qty: number): CartItem[] {
    if (qty < 1) return GuestCart.remove(productId, variantId);
    const updated = GuestCart.getAll().map((i) =>
      i.id === productId && i.variantId === variantId ? { ...i, qty } : i
    );
    GuestCart.save(updated);
    return updated;
  },

  clear(): void {
    localStorage.removeItem(GUEST_CART_KEY);
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
      return Array.isArray(res.data.items) ? res.data.items : [];
    } catch (err) {
      console.error('[DbCart] Failed to get user cart:', err);
      return []; // Do NOT fallback to local storage
    }
  },

  async add(userId: string, item: Omit<CartItem, 'cartItemId' | 'cartId'>): Promise<CartItem[]> {
    try {
      const res = await axios.post('/api/cart/items', { userId, ...item });
      return Array.isArray(res.data.items) ? res.data.items : [];
    } catch (err) {
      console.error('[DbCart] Failed to add item:', err);
      throw new Error('Failed to add item to database cart');
    }
  },

  async remove(cartItemId: string, userId: string): Promise<CartItem[]> {
    try {
      const res = await axios.delete(`/api/cart/items/${cartItemId}?userId=${userId}`);
      return Array.isArray(res.data.items) ? res.data.items : [];
    } catch (err) {
      console.error('[DbCart] Failed to remove item:', err);
      throw new Error('Failed to remove item from database cart');
    }
  },

  async updateQty(cartItemId: string, userId: string, qty: number): Promise<CartItem[]> {
    try {
      const res = await axios.put(`/api/cart/items/${cartItemId}`, { userId, qty });
      return Array.isArray(res.data.items) ? res.data.items : [];
    } catch (err) {
      console.error('[DbCart] Failed to update qty:', err);
      throw new Error('Failed to update quantity in database cart');
    }
  },

  async mergeGuestCart(userId: string): Promise<CartItem[]> {
    const guestItems = GuestCart.getAll();
    if (guestItems.length === 0) {
      return DbCart.getAll(userId);
    }
    try {
      const res = await axios.post('/api/cart/merge', { userId, guestItems });
      GuestCart.clear();
      return Array.isArray(res.data.items) ? res.data.items : [];
    } catch {
      // If merge fails, still clear guest cart and load DB cart
      GuestCart.clear();
      return DbCart.getAll(userId);
    }
  },
};

// ============================================================
// PUBLIC API — used by CartContext
// ============================================================
export const CartService = {
  GuestCart,
  DbCart,

  async getCart(userId?: string): Promise<CartItem[]> {
    if (userId) return DbCart.getAll(userId);
    return GuestCart.getAll();
  },

  async addItem(
    item: Omit<CartItem, 'cartItemId' | 'cartId'>,
    userId?: string
  ): Promise<CartItem[]> {
    if (userId) return DbCart.add(userId, item);
    return GuestCart.add(item);
  },

  async removeItem(
    productId: string,
    variantId: string,
    userId?: string,
    cartItemId?: string
  ): Promise<CartItem[]> {
    if (userId && cartItemId) return DbCart.remove(cartItemId, userId);
    return GuestCart.remove(productId, variantId);
  },

  async updateQty(
    productId: string,
    variantId: string,
    qty: number,
    userId?: string,
    cartItemId?: string
  ): Promise<CartItem[]> {
    if (userId && cartItemId) return DbCart.updateQty(cartItemId, userId, qty);
    return GuestCart.updateQty(productId, variantId, qty);
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
