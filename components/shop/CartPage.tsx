"use client";

import Link from "next/link";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { products, productUrl } from "@/data/catalogue";
import { QuoteButton } from "@/components/forms/QuoteModal";
import { ArtworkLayer } from "./ArtworkLayer";
import { useCart } from "./CartState";
import { ProductMockup } from "./ProductMockup";
import { Quantity } from "./SelectionFields";
import { Price } from "./ShopShared";
import { sides } from "./design";

export function CartPage() {
  const { items, count, remove, setQuantity } = useCart();
  if (!items.length) return <div className="empty-shop">
    <h2>Your demo cart is empty.</h2><p>Choose a product or create a T-shirt design to get started.</p><Link className="button" href="/shop">Continue Shopping <ArrowRight size={17} /></Link>
  </div>;

  const quoteNotes = items.map(item => {
    const product = products.find(entry => entry.id === item.productId)!;
    const size = product.category === "t-shirts" ? ", size " + item.selection.size : "";
    return item.selection.quantity + " × " + product.name + ", " + item.selection.colour.name + size + ", " + item.selection.placement;
  }).join("\n");

  return <div className="cart-layout">
    <ul className="cart-items">
      {items.map(item => {
        const product = products.find(entry => entry.id === item.productId)!;
        const { selection, design } = item;
        const editUrl = product.category === "t-shirts" ? "/customize/t-shirt?edit=" + item.id : productUrl(product) + "?edit=" + item.id;
        const views = selection.placement === "Front & back" ? sides : selection.placement === "Back" ? ["back"] as const : ["front"] as const;
        return <li className="cart-item" key={item.id}>
          <div className="cart-preview">
            {views.map(side => <figure key={side}><ProductMockup product={product} colour={selection.colour.hex} side={side}>
              {design?.[side].map(layer => <ArtworkLayer key={layer.id} layer={layer} />)}
            </ProductMockup><figcaption>{side}</figcaption></figure>)}
          </div>
          <div><h2>{product.name}</h2><p>{selection.colour.name}{product.category === "t-shirts" && " · " + selection.size} · {selection.placement}</p>
            <p>{selection.method}</p><Quantity value={selection.quantity} onChange={quantity => setQuantity(item.id, quantity)} />
            <div className="cart-item-actions">
              <Link href={editUrl} className="textlink"><Pencil size={15} /> Edit customization</Link>
              <button className="textlink" type="button" onClick={() => remove(item.id)}><Trash2 size={15} /> Remove item</button>
            </div>
          </div>
        </li>;
      })}
    </ul>
    <aside className="studio-panel cart-summary"><h2>Cart summary</h2><p>{count} {count === 1 ? "item" : "items"}</p><Price />
      <p>Demo selections and artwork are kept in this browser tab for this visit.</p>
      <Link className="button" href="/checkout">Proceed to Checkout (Demo) <ArrowRight size={17} /></Link>
      <QuoteButton className="button outline-button" notes={quoteNotes} quantity={count}>Request Quote for Cart</QuoteButton>
      <Link className="textlink" href="/shop">Continue Shopping</Link>
    </aside>
  </div>;
}