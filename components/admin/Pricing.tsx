"use client";

import { useState } from "react";
import { formatMoney, quoteTotals, type Pricing as PricingData } from "@/data/admin";
import { useAdmin } from "./AdminState";
import { AdminHeading, Field, Panel } from "./UI";

const configFields: { key: Exclude<keyof PricingData, "methods">; label: string; percentage?: boolean; quantity?: boolean }[] = [
  { key: "front", label: "Front print per unit (₹)" }, { key: "back", label: "Back print per unit (₹)" },
  { key: "additional", label: "Additional placement per unit (₹)" }, { key: "setup", label: "Artwork setup (₹)" },
  { key: "tierQuantity", label: "Tier starts at units", quantity: true }, { key: "tierDiscount", label: "Tier discount (%)", percentage: true },
  { key: "bulkQuantity", label: "Bulk tier starts at units", quantity: true }, { key: "bulkDiscount", label: "Bulk discount (%)", percentage: true },
  { key: "tax", label: "Demo tax (%)", percentage: true }, { key: "shipping", label: "Demo shipping charge (₹)" },
];
const printPlacements = ["Front", "Back", "Front & back", "Additional placement"];

export function Pricing() {
  const { data, update } = useAdmin();
  const { pricing } = data;
  const [productId, setProductId] = useState(data.products[0].id);
  const [method, setMethod] = useState(Object.keys(pricing.methods)[0]);
  const [placement, setPlacement] = useState("Front");
  const [quantity, setQuantity] = useState(25);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState(pricing);
  const product = data.products.find(item => item.id === productId) ?? data.products[0];
  const placementRate = placement === "Front" ? pricing.front : placement === "Back" ? pricing.back :
    placement === "Front & back" ? pricing.front + pricing.back : pricing.additional;
  const discountRate = quantity >= pricing.bulkQuantity ? pricing.bulkDiscount : quantity >= pricing.tierQuantity ? pricing.tierDiscount : 0;
  const printing = (placementRate + pricing.methods[method]) * quantity;
  const merchandise = product.price * quantity + printing;
  const discount = Math.round(merchandise * discountRate) / 100;
  const totals = quoteTotals({ description: product.name, quantity, unitPrice: product.price, printing,
    extras: pricing.setup + pricing.shipping, discount, tax: pricing.tax });

  return <><AdminHeading title="Pricing" description="Configure a hypothetical pricing model. The public catalogue continues to show Price on Request."/>
    <div className="ad-grid-two">
      <Panel title="Pricing rules">
        <form className="ad-form" onSubmit={event => {
          event.preventDefault();
          if (draft.bulkQuantity < draft.tierQuantity) { setMessage("Set the bulk tier at or above the first quantity tier."); return; }
          update(current => ({ ...current, pricing: draft }));
          setMessage("Demo pricing rules saved.");
        }}>
          {Object.entries(draft.methods).map(([name, charge]) => <Field key={name} label={name + " per unit (₹)"}><input type="number" min={0} max={999999} step={.01} required
            value={charge} onChange={event => setDraft({ ...draft, methods: { ...draft.methods, [name]: Number(event.target.value) } })}/></Field>)}
          {configFields.map(({ key, label, percentage, quantity }) => <Field key={key} label={label}><input type="number" min={quantity ? 1 : 0}
            max={percentage ? 100 : 999999} step={quantity ? 1 : .01} value={draft[key]} required onChange={event => setDraft({ ...draft, [key]: Number(event.target.value) })}/></Field>)}
          <button className="ad-button primary">Save pricing rules</button><p className="wide" role="status">{message}</p>
        </form>
      </Panel>
      <Panel title="Live estimate">
        <div className="ad-form-grid">
          <Field label="Product"><select value={productId} onChange={event => setProductId(event.target.value)}>{data.products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          <Field label="Printing method"><select value={method} onChange={event => setMethod(event.target.value)}>{Object.keys(pricing.methods).map(item => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Print placement"><select value={placement} onChange={event => setPlacement(event.target.value)}>{printPlacements.map(item => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Quantity"><input type="number" min={1} max={99999} step={1} value={quantity} onChange={event => {
            const value = event.target.valueAsNumber; if (Number.isSafeInteger(value) && value >= 1 && value <= 99999) setQuantity(value);
          }}/></Field>
        </div>
        <dl className="ad-info ad-spaced" aria-live="polite">
          {[["Product base per unit", product.price], ["Printing", printing], ["Setup", pricing.setup], ["Shipping", pricing.shipping], ["Discount (" + discountRate + "%)", discount], ["Tax", totals.tax], ["Estimated total", totals.total]].map(([label, amount]) =>
            <div key={label}><dt>{label}</dt><dd>{formatMoney(Number(amount))}</dd></div>)}
        </dl><p className="ad-spaced">The estimate uses saved demo rates. Set per-product base prices in Products.</p>
      </Panel>
    </div>
  </>;
}