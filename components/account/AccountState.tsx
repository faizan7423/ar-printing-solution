"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { demoAddresses, demoProfile, type Address } from "@/data/account";
import type { CartItem, Design } from "@/components/shop/CartState";

export type SavedDesign = Omit<CartItem, "design"> & { title: string; design: Design };
export type DesignDraft = Omit<SavedDesign, "id" | "title">;

const rememberKey = "ar-demo-remembered";
const rememberEvent = "ar-demo-session-changed";

function subscribeRemember(listener: () => void) {
  window.addEventListener(rememberEvent, listener);
  return () => window.removeEventListener(rememberEvent, listener);
}

function readRemember() {
  try { return sessionStorage.getItem(rememberKey) === "yes"; }
  catch { return false; }
}

function writeRemember(remember: boolean) {
  try {
    if (remember) sessionStorage.setItem(rememberKey, "yes");
    else sessionStorage.removeItem(rememberKey);
  } catch { /* Demo sign-in remains available in memory. */ }
  window.dispatchEvent(new Event(rememberEvent));
}

function useDemoState() {
  const [active, setActive] = useState(false);
  const remembered = useSyncExternalStore(subscribeRemember, readRemember, () => false);
  const signedIn = active || remembered;
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [studioDraft, setStudioDraft] = useState<DesignDraft & { cartId?: string }>();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addresses, setAddresses] = useState(demoAddresses);
  const [profile, setProfile] = useState(demoProfile);
  const [preferences, setPreferences] = useState({ orders: true, news: false });

  function signOut() {
    setActive(false);
    writeRemember(false);
    setDesigns([]);
    setStudioDraft(undefined);
    setWishlist([]);
    setAddresses(demoAddresses);
    setProfile(demoProfile);
    setPreferences({ orders: true, news: false });
  }

  function saveDesign(draft: DesignDraft, id?: string) {
    if (!signedIn) return;
    const key = id ?? crypto.randomUUID();
    setDesigns(current => {
      const existing = current.find(design => design.id === key);
      return existing
        ? current.map(design => design.id === key ? { ...design, ...draft } : design)
        : [...current, { ...draft, id: key, title: "T-shirt design " + (current.length + 1) }];
    });
    return key;
  }

  function renameDesign(id: string, title: string) {
    setDesigns(current => current.map(design => design.id === id ? { ...design, title } : design));
  }

  function duplicateDesign(id: string) {
    const key = crypto.randomUUID();
    setDesigns(current => {
      const original = current.find(design => design.id === id);
      return original ? [...current, { ...original, id: key, title: original.title.slice(0, 53) + " (copy)" }] : current;
    });
  }

  function deleteDesign(id: string) { setDesigns(current => current.filter(design => design.id !== id)); }

  function toggleWishlist(id: string) {
    setWishlist(current => current.includes(id) ? current.filter(product => product !== id) : [...current, id]);
  }

  function saveAddress(fields: Omit<Address, "id" | "primary">, id?: string) {
    const key = id ?? crypto.randomUUID();
    setAddresses(current => id
      ? current.map(address => address.id === id ? { ...address, ...fields } : address)
      : [...current, { ...fields, id: key, primary: current.length === 0 }]);
  }

  function defaultAddress(id: string) {
    setAddresses(current => current.map(address => ({ ...address, primary: address.id === id })));
  }

  function deleteAddress(id: string) {
    setAddresses(current => {
      const remaining = current.filter(address => address.id !== id);
      return remaining.some(address => address.primary) ? remaining : remaining.map((address, index) => ({ ...address, primary: index === 0 }));
    });
  }

  return { signedIn, signIn: (remember = false) => { setActive(true); writeRemember(remember); }, signOut, designs, saveDesign, renameDesign, duplicateDesign, deleteDesign,
    studioDraft, setStudioDraft, wishlist, toggleWishlist, addresses, saveAddress, deleteAddress, defaultAddress, profile, setProfile, preferences, setPreferences };
}

const AccountContext = createContext<ReturnType<typeof useDemoState> | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  return <AccountContext.Provider value={useDemoState()}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const state = useContext(AccountContext);
  if (!state) throw new Error("AccountProvider is required");
  return state;
}