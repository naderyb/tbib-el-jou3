"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
  customizations?: string[];
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "CLEAR_RESTAURANT"; payload: string };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { payload } = action;
      const existingItem = state.items.find(item => item.id === payload.id);
      
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === payload.id
            ? { ...item, quantity: item.quantity + (payload.quantity || 1) }
            : item
        );
      } else {
        newItems = [...state.items, { ...payload, quantity: payload.quantity || 1 }];
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { items: newItems, total, itemCount };
    }
    
    case "REMOVE_ITEM": {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { items: newItems, total, itemCount };
    }
    
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: id });
      }
      
      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { items: newItems, total, itemCount };
    }
    
    case "CLEAR_CART":
      return initialState;
    
    case "CLEAR_RESTAURANT": {
      const newItems = state.items.filter(item => item.restaurantId !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { items: newItems, total, itemCount };
    }
    
    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearRestaurant: (restaurantId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    // Check if adding item from different restaurant
    if (state.items.length > 0 && state.items[0].restaurantId !== item.restaurantId) {
      const confirmClear = window.confirm(
        `You have items from ${state.items[0].restaurantName}. Adding items from ${item.restaurantName} will clear your current cart. Continue?`
      );
      
      if (confirmClear) {
        dispatch({ type: "CLEAR_CART" });
        dispatch({ type: "ADD_ITEM", payload: item });
        // Only show toast if we have access to it
        if (typeof window !== 'undefined') {
          console.log(`${item.name} added to cart`);
        }
      }
      return;
    }
    
    dispatch({ type: "ADD_ITEM", payload: item });
    if (typeof window !== 'undefined') {
      console.log(`${item.name} added to cart`);
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    if (typeof window !== 'undefined') {
      console.log("Item removed from cart");
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    if (typeof window !== 'undefined') {
      console.log("Cart cleared");
    }
  };

  const clearRestaurant = (restaurantId: string) => {
    dispatch({ type: "CLEAR_RESTAURANT", payload: restaurantId });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearRestaurant,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}