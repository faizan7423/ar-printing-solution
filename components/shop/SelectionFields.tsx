"use client";

import { Minus, Plus } from "lucide-react";
import { placements, printMethods, sizes, type Product } from "@/data/catalogue";
import type { Selection } from "./CartState";

export function defaultSelection(product: Product): Selection {
  return { colour: product.colourChoices[0], size: "M", quantity: 1, placement: "Front", method: "Please advise" };
}

export function Quantity({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <div className="quantity">
    <button type="button" disabled={value <= 1} onClick={() => onChange(value - 1)} aria-label="Decrease quantity"><Minus size={15} /></button>
    <input type="number" min={1} max={9999} aria-label="Quantity" value={value}
      onChange={event => { const next = event.target.valueAsNumber; if (Number.isSafeInteger(next) && next >= 1 && next <= 9999) onChange(next); }} />
    <button type="button" disabled={value >= 9999} onClick={() => onChange(value + 1)} aria-label="Increase quantity"><Plus size={15} /></button>
  </div>;
}

export function ColourField({ product, value, onChange }: { product: Product; value: Selection["colour"]; onChange: (value: Selection["colour"]) => void }) {
  return <fieldset><legend>Colour <span>{value.name}</span></legend><div className="swatch-row">
    {product.colourChoices.map(colour => <button type="button" className="swatch" key={colour.name} style={{ background: colour.hex }} title={colour.name} aria-label={colour.name} aria-pressed={colour.name === value.name} onClick={() => onChange(colour)} />)}
  </div></fieldset>;
}

export function SizeField({ value, onChange }: { value: Selection["size"]; onChange: (value: Selection["size"]) => void }) {
  return <fieldset><legend>Size</legend><div className="size-row">
    {sizes.map(size => <button type="button" key={size} aria-pressed={size === value} onClick={() => onChange(size)}>{size}</button>)}
  </div></fieldset>;
}

export function PrintFields({ value, onChange, showPlacement = true }: { value: Selection; onChange: (value: Selection) => void; showPlacement?: boolean }) {
  return <div className="print-fields">
    {showPlacement && <label>Print placement<select value={value.placement} onChange={event => onChange({ ...value, placement: event.target.value as Selection["placement"] })}>
      {placements.map(item => <option key={item}>{item}</option>)}
    </select></label>}
    <label>Printing method<select value={value.method} onChange={event => onChange({ ...value, method: event.target.value as Selection["method"] })}>
      {printMethods.map(item => <option key={item}>{item}</option>)}
    </select></label>
  </div>;
}