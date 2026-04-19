import { create } from 'zustand'

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  orderType: 'dine_in' | 'takeaway';
  activeCategory: string;
  
  // Computed values that shouldn't typically be stored in state, 
  // but keeping it simple for the hook abstraction
  subtotal: number;
  tax: number;
  grandTotal: number;

  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  setOrderType: (type: 'dine_in' | 'takeaway') => void;
  setActiveCategory: (catId: string) => void;
  clearCart: () => void;
}

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.10; // PB1 10%
  const grandTotal = subtotal + tax;
  return { subtotal, tax, grandTotal };
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  orderType: 'dine_in',
  activeCategory: 'all',
  subtotal: 0,
  tax: 0,
  grandTotal: 0,

  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.id === product.id);
    let newItems;
    if (existing) {
      newItems = state.items.map(i => 
        i.id === product.id ? { ...i, qty: i.qty + 1 } : i
      );
    } else {
      newItems = [...state.items, { ...product, qty: 1 }];
    }
    return { items: newItems, ...calculateTotals(newItems) };
  }),

  removeItem: (id) => set((state) => {
    const newItems = state.items.filter(i => i.id !== id);
    return { items: newItems, ...calculateTotals(newItems) };
  }),

  updateQty: (id, qty) => set((state) => {
    if (qty <= 0) {
      const newItems = state.items.filter(i => i.id !== id);
      return { items: newItems, ...calculateTotals(newItems) };
    }
    const newItems = state.items.map(i => 
      i.id === id ? { ...i, qty } : i
    );
    return { items: newItems, ...calculateTotals(newItems) };
  }),

  setOrderType: (type) => set({ orderType: type }),
  setActiveCategory: (catId) => set({ activeCategory: catId }),
  
  clearCart: () => set({ items: [], subtotal: 0, tax: 0, grandTotal: 0 }),
}))
