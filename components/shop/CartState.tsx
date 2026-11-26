"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Colour, placements, printMethods, sizes } from "@/data/catalogue";

export type Side = "front" | "back";
type Position = { id: string; x: number; y: number; width: number; angle: number };
export type Artwork =
  | (Position & { kind: "text"; text: string; font: string; ink: string })
  | (Position & { kind: "image"; file: File; ratio: number });
export type Design = Record<Side, Artwork[]>;
export type Selection = { colour: Colour; size: typeof sizes[number]; quantity: number; placement: typeof placements[number]; method: typeof printMethods[number] };
export type CartItem = { id: string; productId: string; selection: Selection; design?: Design };

type Cart = {
  items: CartItem[]; count: number;
  save: (item: Omit<CartItem, "id">, id?: string) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
};

const CartContext = createContext<Cart | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const count = items.reduce((total, item) => total + item.selection.quantity, 0);
  function save(item: Omit<CartItem, "id">, id?: string) {
    const next = { ...item, id: id ?? crypto.randomUUID() };
    setItems(previous => previous.some(entry => entry.id === next.id)
      ? previous.map(entry => entry.id === next.id ? next : entry)
      : [...previous, next]);
  }
  function remove(id: string) { setItems(previous => previous.filter(item => item.id !== id)); }
  function setQuantity(id: string, quantity: number) {
    setItems(previous => previous.map(item => item.id === id ? { ...item, selection: { ...item.selection, quantity } } : item));
  }
  return <CartContext.Provider value={{ items, count, save, remove, setQuantity }}>{children}</CartContext.Provider>;
}
export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("CartProvider is required");
  return cart;
}