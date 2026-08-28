import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvAdapter } from '@/core/storage';

import type { CartItem, CartSummary, Product } from '../types';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSummary: () => CartSummary;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.product.id === product.id);

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = Math.min(
            updatedItems[existingIndex].quantity + quantity,
            product.stockCount || 10,
          );
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: newQty,
          };
          set({ items: updatedItems });
        } else {
          set({
            items: [
              ...currentItems,
              {
                product,
                quantity: Math.min(quantity, product.stockCount || 10),
              },
            ],
          });
        }
      },

      removeFromCart: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (item.product.id === productId) {
              const maxQty = item.product.stockCount || 10;
              return { ...item, quantity: Math.min(quantity, maxQty) };
            }
            return item;
          }),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSummary: () => {
        const items = get().items;
        const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        // Ayush 10% discount on orders above ₹1000
        const discount = subtotal >= 1000 ? Math.round(subtotal * 0.1) : 0;

        // Free delivery on orders above ₹500
        const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 50;

        const total = subtotal - discount + deliveryFee;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
          subtotal,
          discount,
          deliveryFee,
          total,
          itemCount,
        };
      },
    }),
    {
      name: 'amrutam_cart_storage',
      storage: createJSONStorage(() => mmkvAdapter),
    },
  ),
);
