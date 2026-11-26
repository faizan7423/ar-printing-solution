"use client";

import Link from "next/link";
import { products } from "@/data/catalogue";
import { ProductCard } from "@/components/shop/ShopShared";
import { useAccount } from "./AccountState";

export function Wishlist() {
  const { wishlist } = useAccount();
  const saved = products.filter(product => wishlist.includes(product.id));
  return <>
    <div className="account-heading"><h2>Wishlist</h2><p>Keep track of products you want to customise during this visit.</p></div>
    {saved.length ? <><div className="product-grid wishlist-grid">{saved.map(product => <ProductCard key={product.id} product={product}/>)}</div>
      <Link className="textlink" href="/shop">Continue Shopping</Link></>
      : <div className="account-empty"><h3>Your wishlist is empty</h3><p>Tap the heart on any product to save it here.</p><Link className="button" href="/shop">Continue Shopping</Link></div>}
  </>;
}