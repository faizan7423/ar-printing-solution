"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { allowedOrderStages, buildVariants, makeDemoData, type ArtStage, type ArtworkRecord, type Order, type OrderStage, type ProductRecord } from "@/data/admin";

const now = () => new Date().toISOString();
export function note(text: string) { return { text: text.trim(), date: now() }; }
function advance(order: Order, status: OrderStage): Order {
  return { ...order, status, timeline: [...order.timeline, { status, date: now() }] };
}

export function allowedArtworkStages(item: ArtworkRecord): ArtStage[] {
  switch (item.status) {
    case "Pending Review": return ["Under Review", "Approved", "Revision Required", "Awaiting Customer Approval", "Rejected"];
    case "Under Review": return ["Approved", "Revision Required", "Awaiting Customer Approval", "Rejected"];
    case "Revision Required": return ["Under Review", "Rejected"];
    case "Awaiting Customer Approval": return ["Approved", "Revision Required", "Rejected"];
    default: return [];
  }
}

function useAdminStore() {
  const [signedIn, setSignedIn] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [data, update] = useState(makeDemoData);

  function transitionOrder(id: string, status: OrderStage) {
    update(current => ({ ...current, orders: current.orders.map(order =>
      order.id === id && allowedOrderStages(order, current.artwork).includes(status) ? advance(order, status) : order) }));
  }

  function reviewArtwork(id: string, status: ArtStage, message: string) {
    update(current => {
      const item = current.artwork.find(art => art.id === id);
      const order = current.orders.find(order => order.id === item?.orderId);
      if (!item || !allowedArtworkStages(item).includes(status) || order?.status === "Cancelled") return current;
      const reviewStatus: OrderStage | undefined = status === "Approved" ? "Approved" :
        status === "Awaiting Customer Approval" ? "Awaiting Customer Approval" : "Artwork Review";
      return {
        ...current,
        artwork: current.artwork.map(art => art.id === id ? { ...art, status, notes: [...art.notes, note(message || status)] } : art),
        orders: current.orders.map(order => {
          if (order.id !== item.orderId || !reviewStatus || !["Order Received", "Artwork Review", "Awaiting Customer Approval"].includes(order.status) || order.status === reviewStatus) return order;
          return advance(order, reviewStatus);
        }),
      };
    });
  }

  function saveProduct(product: ProductRecord) {
    const id = product.id || "product-" + crypto.randomUUID();
    const saved = { ...product, id };
    update(current => {
      const exists = current.products.some(item => item.id === id);
      const template = buildVariants(saved);
      const activeIds = new Set(template.map(item => item.id));
      const previous = new Map(current.variants.filter(item => item.productId === id).map(item => [item.id, item]));
      return {
        ...current,
        products: exists ? current.products.map(item => item.id === id ? saved : item) : [...current.products, saved],
        variants: [
          ...current.variants.filter(item => item.productId !== id),
          ...Array.from(previous.values()).filter(item => !activeIds.has(item.id)).map(item => ({ ...item, active: false })),
          ...template.map(variant => {
            const prior = previous.get(variant.id);
            return prior ? { ...variant, available: prior.available, reserved: prior.reserved } : variant;
          }),
        ],
      };
    });
    return id;
  }

  function adjustStock(id: string, delta: number, reason: string) {
    if (!Number.isSafeInteger(delta) || !delta || !reason.trim()) return;
    const movement = { id: crypto.randomUUID(), variantId: id, delta, reason: reason.trim(), date: now() };
    update(current => {
      const variant = current.variants.find(item => item.id === id && item.active);
      if (!variant || variant.available + delta < 0 || !Number.isSafeInteger(variant.available + delta)) return current;
      return { ...current, variants: current.variants.map(item => item.id === id ? { ...item, available: item.available + delta } : item),
        movements: [movement, ...current.movements] };
    });
  }

  return { signedIn, signIn: () => setSignedIn(true), signOut: () => { setSignedIn(false); update(makeDemoData()); },
    reset: () => { update(makeDemoData()); setResetToken(token => token + 1); }, resetToken, data, update, transitionOrder, reviewArtwork, saveProduct, adjustStock };
}

const AdminContext = createContext<ReturnType<typeof useAdminStore> | null>(null);
export function AdminProvider({ children }: { children: ReactNode }) {
  return <AdminContext.Provider value={useAdminStore()}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const state = useContext(AdminContext);
  if (!state) throw new Error("AdminProvider is required");
  return state;
}
