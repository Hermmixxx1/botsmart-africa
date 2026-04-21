import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// Supported currencies in Southern Africa
export const SUPPORTED_CURRENCIES = [
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', flag: '🇳🇦' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', flag: '🇧🇼' },
  { code: 'ZWL', name: 'Zimbabwe Dollar', symbol: '$', flag: '🇿🇼' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', flag: '🇲🇿' },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', flag: '🇱🇸' },
  { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'E', flag: '🇸🇿' },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', flag: '🇦🇴' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲' },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', flag: '🇲🇼' },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', flag: '🇲🇬' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

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

  // Currency
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  getCurrencyInfo: () => typeof SUPPORTED_CURRENCIES[number];

  // Cart total
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      user: null,
      currency: 'ZAR', // Default to South African Rand

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

      setCurrency: (currency) => set({ currency }),

      getCurrencyInfo: () => {
        const { currency } = get();
        return SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];
      },

      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'botsmart-storage',
      partialize: (state) => ({
        cart: state.cart,
        currency: state.currency,
      }),
    }
  )
);
