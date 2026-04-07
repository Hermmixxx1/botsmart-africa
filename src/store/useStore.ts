import { create } from 'zustand';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  slug: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (product_id: string) => void;
  updateQuantity: (product_id: string, quantity: number) => void;
  clearCart: () => void;

  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Cart total
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  user: null,

  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cart.find((i) => i.product_id === item.product_id);
      if (existingItem) {
        return {
          cart: state.cart.map((i) =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return {
        cart: [...state.cart, { ...item, id: crypto.randomUUID() }],
      };
    }),

  removeFromCart: (product_id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product_id !== product_id),
    })),

  updateQuantity: (product_id, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product_id === product_id ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ cart: [] }),

  setUser: (user) => set({ user }),

  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getCartCount: () => {
    const { cart } = get();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },
}));
