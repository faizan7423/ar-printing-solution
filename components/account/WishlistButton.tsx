"use client";
import { Heart } from "lucide-react";
import { useAccount } from "./AccountState";
export function WishlistButton({ productId, productName }: { productId: string; productName: string }) {
  const { wishlist, toggleWishlist } = useAccount();
  const saved = wishlist.includes(productId);
  return <button className="icon-button wishlist-button" type="button" aria-pressed={saved} aria-label={(saved ? "Remove from wishlist: " : "Save to wishlist: ") + productName}
    onClick={() => toggleWishlist(productId)}>
    <Heart size={20} fill={saved ? "currentColor" : "none"} aria-hidden="true"/>
  </button>;
}

