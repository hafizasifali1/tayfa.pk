import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from './CartContext';

export interface WishlistItem extends Product {
  addedAt: string;
  originalPrice: number;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  moveToCart: (product: Product, size?: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const savedWishlist = localStorage.getItem('tayfa_wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tayfa_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: Product) => {
    if (!wishlist.find((item) => item.id === product.id)) {
      const newItem: WishlistItem = {
        ...product,
        addedAt: new Date().toISOString(),
        originalPrice: product.price
      };
      setWishlist((prev) => [...prev, newItem]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const moveToCart = (product: Product, size?: string) => {
    const sz = size || (Array.isArray(product.sizes) ? product.sizes[0] : undefined);
    addToCart(product, sz ? { Size: sz } : undefined);
    removeFromWishlist(product.id);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, moveToCart }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
