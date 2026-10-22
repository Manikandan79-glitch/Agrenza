"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Order, Product } from "./types";

type CartContextType = {
  items: CartItem[];
  addItem: (p: Product, qty: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  orders: Order[];
  placeOrder: (paymentMode: "cod" | "online") => Order;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "farmlink_cart";
const ORDERS_KEY = "farmlink_orders";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY);
      const o = localStorage.getItem(ORDERS_KEY);
      if (c) setItems(JSON.parse(c));
      if (o) setOrders(JSON.parse(o));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  function addItem(p: Product, qty: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { productId: p.id, name: p.name, price: p.price, icon: p.icon, qty }];
    });
  }

  function removeItem(productId: number) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  function placeOrder(paymentMode: "cod" | "online"): Order {
    const order: Order = {
      id: Date.now(),
      date: new Date().toISOString(),
      items,
      total,
      paymentMode,
      status: "pending",
    };
    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, total, count, orders, placeOrder }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
