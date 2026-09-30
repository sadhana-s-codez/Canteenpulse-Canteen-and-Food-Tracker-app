import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CartItem, FoodItem } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (food: FoodItem) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalAmount: 0,
  totalItems: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((food: FoodItem) => {
    if (!food.available || food.stock <= 0) {
      toast.error(`${food.name} is currently unavailable`);
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.food.id === food.id);
      if (existing) {
        if (existing.quantity >= food.stock) {
          toast.error(`Only ${food.stock} available`);
          return prev;
        }
        return prev.map((i) =>
          i.food.id === food.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { food, quantity: 1 }];
    });
    toast.success(`${food.name} added to cart`);
  }, []);

  const removeItem = useCallback((foodId: string) => {
    setItems((prev) => prev.filter((i) => i.food.id !== foodId));
  }, []);

  const updateQuantity = useCallback((foodId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.food.id !== foodId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.food.id === foodId) {
          if (quantity > i.food.stock) {
            toast.error(`Only ${i.food.stock} available`);
            return i;
          }
          return { ...i, quantity };
        }
        return i;
      })
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalAmount = items.reduce((sum, i) => sum + i.food.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalAmount, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
};
