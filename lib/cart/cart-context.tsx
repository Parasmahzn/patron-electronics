'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { MAX_CART_QUANTITY } from '@/config/site';
import type { CartItem } from '@/types/cart';

type CartState = { items: CartItem[]; hydrated: boolean };

type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; productId: number }
  | { type: 'INCREMENT'; productId: number }
  | { type: 'DECREMENT'; productId: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] };

const STORAGE_KEY = 'patron-electronics-cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items, hydrated: true };
    case 'ADD': {
      const existing = state.items.find((i) => i.productId === action.item.productId);
      if (existing) {
        const quantity = Math.min(
          existing.quantity + action.item.quantity,
          existing.maxStock,
          MAX_CART_QUANTITY,
        );
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.item.productId ? { ...i, quantity } : i,
          ),
        };
      }
      const quantity = Math.min(action.item.quantity, action.item.maxStock, MAX_CART_QUANTITY);
      return { ...state, items: [...state.items, { ...action.item, quantity }] };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock, MAX_CART_QUANTITY) }
            : i,
        ),
      };
    case 'DECREMENT':
      return {
        ...state,
        items: state.items
          .map((i) => (i.productId === action.productId ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: number) => void;
  increment: (productId: number) => void;
  decrement: (productId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], hydrated: false });

  // Guest cart lives only in localStorage — the server never trusts it and
  // recalculates prices/stock/totals from the database at checkout time.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      dispatch({ type: 'HYDRATE', items: raw ? (JSON.parse(raw) as CartItem[]) : [] });
    } catch {
      dispatch({ type: 'HYDRATE', items: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, state.hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return {
      items: state.items,
      itemCount,
      subtotal,
      hydrated: state.hydrated,
      addItem: (item) => dispatch({ type: 'ADD', item: { ...item, quantity: item.quantity ?? 1 } }),
      removeItem: (productId) => dispatch({ type: 'REMOVE', productId }),
      increment: (productId) => dispatch({ type: 'INCREMENT', productId }),
      decrement: (productId) => dispatch({ type: 'DECREMENT', productId }),
      clear: () => dispatch({ type: 'CLEAR' }),
    };
  }, [state.items, state.hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
