import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  seller: string;
  location: string;
  isOrganic?: boolean;
  productId?: string; // Real product ID if exists
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'agrihub_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage for guests, Supabase for authenticated users
  useEffect(() => {
    if (user) {
      loadCartFromDB();
    } else {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      setItems(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  // Persist cart to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user]);

  const loadCartFromDB = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const cartItems: CartItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.product_data?.title || 'Product',
          price: item.product_data?.price || 0,
          unit: item.product_data?.unit || 'unit',
          quantity: item.quantity,
          image: item.product_data?.image || '🌾',
          seller: item.product_data?.seller || 'Farmer',
          location: item.product_data?.location || 'India',
          isOrganic: item.product_data?.isOrganic || false,
          productId: item.product_id,
        }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncItemToDB = async (item: CartItem, action: 'add' | 'update' | 'remove') => {
    if (!user) return;

    try {
      if (action === 'add') {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: item.productId || null,
          product_data: {
            title: item.title,
            price: item.price,
            unit: item.unit,
            image: item.image,
            seller: item.seller,
            location: item.location,
            isOrganic: item.isOrganic,
          },
          quantity: item.quantity,
        });
      } else if (action === 'update') {
        await supabase
          .from('cart_items')
          .update({ quantity: item.quantity })
          .eq('id', item.id)
          .eq('user_id', user.id);
      } else if (action === 'remove') {
        await supabase
          .from('cart_items')
          .delete()
          .eq('id', item.id)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id || (i.productId && i.productId === item.productId));
      if (existing) {
        const updated = prev.map(i =>
          i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
        );
        if (user) {
          syncItemToDB({ ...existing, quantity: existing.quantity + 1 }, 'update');
        }
        return updated;
      }
      const newItem = { ...item, quantity: 1 };
      if (user) {
        syncItemToDB(newItem as CartItem, 'add').then(() => loadCartFromDB());
      }
      return [...prev, newItem as CartItem];
    });
  }, [user]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item && user) {
        syncItemToDB(item, 'remove');
      }
      return prev.filter(i => i.id !== id);
    });
  }, [user]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, quantity } : i);
      const item = updated.find(i => i.id === id);
      if (item && user) {
        syncItemToDB(item, 'update');
      }
      return updated;
    });
  }, [user, removeItem]);

  const clearCart = useCallback(async () => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
    }
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, [user]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
