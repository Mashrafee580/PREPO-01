import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'pt_cart';

export const useCartStore = create((set, get) => ({
  items: [],
  deliveryOption: { id: 'standard', label: 'Standard Delivery', price: 3.99 },

  loadCart: async () => {
    try {
      const stored = await AsyncStorage.getItem(CART_KEY);
      if (stored) set({ items: JSON.parse(stored) });
    } catch {}
  },

  _persist: async (items) => {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  addItem: (book, qty = 1) => {
    const { items } = get();
    const idx = items.findIndex((i) => i._id === book._id);
    let updated;
    if (idx > -1) {
      updated = items.map((i, index) =>
        index === idx ? { ...i, qty: Math.min(i.qty + qty, book.stock) } : i
      );
    } else {
      updated = [...items, { ...book, qty: Math.min(qty, book.stock) }];
    }
    set({ items: updated });
    get()._persist(updated);
  },

  updateQty: (bookId, qty) => {
    const { items } = get();
    const updated = items.map((i) => (i._id === bookId ? { ...i, qty } : i));
    set({ items: updated });
    get()._persist(updated);
  },

  removeItem: (bookId) => {
    const updated = get().items.filter((i) => i._id !== bookId);
    set({ items: updated });
    get()._persist(updated);
  },

  clearCart: () => {
    set({ items: [] });
    AsyncStorage.removeItem(CART_KEY);
  },

  setDelivery: (option) => set({ deliveryOption: option }),

  getSubtotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
  getTotal: () => get().getSubtotal() + get().deliveryOption.price,
  getCount: () => get().items.reduce((s, i) => s + i.qty, 0),
}));
