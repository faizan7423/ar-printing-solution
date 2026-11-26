"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/data/catalogue";
import { useCart } from "./CartState";
import { useAccount } from "@/components/account/AccountState";
import { authLink } from "@/data/account";
import { Price } from "./ShopShared";

export function Checkout() {
  const { items, count } = useCart();
  const { signedIn } = useAccount();
  const [finished, setFinished] = useState(false);
  const [contact, setContact] = useState<"email" | "phone">("email");
  const confirmation = useRef<HTMLDivElement>(null);

  if (finished) return <div className="empty-shop" ref={confirmation} tabIndex={-1} role="status">
    <h2>Checkout demo complete.</h2><p>No order or payment was processed. Your contact and address details were cleared.</p>
    <Link className="button" href="/cart">Return to Demo Cart <ArrowRight size={18}/></Link>
  </div>;

  if (!items.length) return <div className="empty-shop">
    <h2>Your demo cart is empty.</h2><p>Add a product to try the checkout workflow.</p><Link className="button" href="/shop">Explore the Catalogue <ArrowRight size={18}/></Link>
  </div>;

  return <>
    {!signedIn && <section className="checkout-choice" aria-label="Checkout options">
      <div><h2>How would you like to continue?</h2><p>Shop as a guest or try the demo customer account.</p></div>
      <div className="order-actions">
        <a className="button" href="#guest-checkout">Continue as Guest</a>
        <Link className="button outline-button" href={authLink("/sign-in", "/checkout")}>Sign In</Link>
        <Link className="textlink" href={authLink("/sign-up", "/checkout")}>Create Account</Link>
      </div>
    </section>}
    <div className="checkout-layout">
    <form id="guest-checkout" tabIndex={-1} className="studio-panel checkout-form" autoComplete="off" onSubmit={event => {
      event.preventDefault();
      event.currentTarget.reset();
      setFinished(true);
      requestAnimationFrame(() => confirmation.current?.focus());
    }}>
      <h2>Customer and delivery details</h2>
      <fieldset><legend>Customer details</legend>
        <div className="checkout-fields">
          <label>Full name<input required pattern=".*\S.*" maxLength={100} /></label>
          <label>Company (optional)<input maxLength={120} /></label>
          <label>Email{contact !== "email" ? " (optional)" : ""}<input type="email" required={contact === "email"} /></label>
          <label>Phone{contact !== "phone" ? " (optional)" : ""}<input type="tel" required={contact === "phone"} pattern="[0-9+\(\) \-]{7,20}" title="Enter a phone number with 7 to 20 characters" /></label>
          <label>Preferred contact method<select value={contact} onChange={event => setContact(event.target.value === "phone" ? "phone" : "email")}>
            <option value="email">Email</option><option value="phone">Phone</option>
          </select></label>
        </div>
      </fieldset>
      <fieldset><legend>Delivery address</legend>
        <div className="checkout-fields">
          <label className="wide">Street address<input required maxLength={160} /></label>
          <label>Apartment or landmark (optional)<input maxLength={120} /></label>
          <label>City<input required maxLength={100} /></label>
          <label>State or region<input required maxLength={100} /></label>
          <label>Postal code<input required maxLength={20} /></label>
        </div>
      </fieldset>
      <label className="check-line"><input type="checkbox" required /> I understand the preview is illustrative and final artwork requires approval before production.</label>
      <button className="button" type="submit">Complete Checkout Demo <ArrowRight size={18} /></button>
    </form>
    <aside className="studio-panel cart-summary"><h2>Order summary</h2><p>{count} {count === 1 ? "item" : "items"} in the demo cart.</p>
      <ul>{items.map(item => <li key={item.id}>
        <strong>{item.selection.quantity} × {products.find(product => product.id === item.productId)?.name}</strong>
        <p>{item.selection.colour.name} · {item.selection.placement}</p>
      </li>)}</ul>
      <Price /><Link className="textlink" href="/cart">Edit Demo Cart</Link>
    </aside>
  </div></>;
}