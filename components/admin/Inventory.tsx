"use client";

import { useState } from "react";
import { formatDate, type Variant } from "@/data/admin";
import { useAdmin } from "./AdminState";
import { AdminHeading, Badge, Empty, Field, Modal, Panel } from "./UI";

export function Inventory() {
  const { data, adjustStock } = useAdmin();
  const [query, setQuery] = useState("");
  const [low, setLow] = useState(false);
  const [selected, setSelected] = useState<Variant>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const name = (productId: string) => data.products.find(product => product.id === productId)?.name ?? "";
  const list = data.variants.filter(item => item.active && data.products.some(product => product.id === item.productId && product.status !== "Archived") &&
    (!low || item.available <= item.threshold) && (item.sku + " " + name(item.productId)).toLowerCase().includes(query.trim().toLowerCase()));
  const selectedCurrent = data.variants.find(item => item.id === selected?.id);

  return <><AdminHeading title="Inventory" description="Review fictional available and reserved stock by colour and size."/>
    <Panel title="Variant inventory">
      <div className="ad-filters"><Field label="Search stock"><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Product or SKU"/></Field>
        <label className="ad-inline-check"><input type="checkbox" checked={low} onChange={event => setLow(event.target.checked)}/> Low stock only</label></div>
      <p role="status">{message || list.length + " variants"}</p>
      {list.length ? <div className="ad-table-wrap ad-stock-table" tabIndex={0} role="region" aria-label="Inventory variants"><table><thead><tr>
        <th>Product</th><th>Variant SKU</th><th>Colour</th><th>Size</th><th>Available</th><th>Reserved</th><th>Threshold</th><th>Stock status</th><th>Action</th>
      </tr></thead><tbody>{list.map(item => <tr key={item.id}>
        <th scope="row">{name(item.productId)}</th><td>{item.sku}</td><td>{item.colour}</td><td>{item.size}</td><td>{item.available}</td><td>{item.reserved}</td><td>{item.threshold}</td>
        <td><Badge label={item.available === 0 ? "Out of stock" : item.available <= item.threshold ? "Low stock" : "In stock"}/></td>
        <td><button className="ad-button secondary" type="button" aria-label={"Adjust " + item.sku} onClick={() => { setError(""); setSelected(item); }}>Adjust stock</button></td>
      </tr>)}</tbody></table></div> : <Empty title="No variants match"/>}
    </Panel>
    <Panel title="Stock movement history">
      {data.movements.length ? <ul className="ad-notes">{data.movements.map(movement => <li key={movement.id}>
        <strong>{data.variants.find(item => item.id === movement.variantId)?.sku} · {movement.delta > 0 ? "+" : ""}{movement.delta}</strong>
        <p>{movement.reason}</p><time dateTime={movement.date}>{formatDate(movement.date)}</time>
      </li>)}</ul> : <Empty title="No stock adjustments yet"/>}
    </Panel>
    {selectedCurrent && <Modal title={"Adjust " + selectedCurrent.sku} close={() => setSelected(undefined)}>
      <p>{selectedCurrent.available} available · {selectedCurrent.reserved} reserved</p>
      <form className="ad-form ad-spaced" onSubmit={event => {
        event.preventDefault();
        const [direction] = event.currentTarget.querySelectorAll("select");
        const amount = event.currentTarget.querySelector<HTMLInputElement>("input")?.valueAsNumber ?? 0;
        const reason = event.currentTarget.querySelector("textarea")?.value.trim() ?? "";
        const delta = direction.value === "decrease" ? -amount : amount;
        if (!reason || !Number.isSafeInteger(delta) || !delta) { setError("Enter a whole quantity and an adjustment reason."); return; }
        if (selectedCurrent.available + delta < 0) { setError("Available stock cannot go below zero."); return; }
        adjustStock(selectedCurrent.id, delta, reason);
        setMessage("Stock adjustment recorded for " + selectedCurrent.sku + ".");
        setSelected(undefined);
      }}>
        <Field label="Adjustment"><select><option value="increase">Increase stock</option><option value="decrease">Decrease stock</option></select></Field>
        <Field label="Quantity"><input type="number" required min={1} max={999999} step={1}/></Field>
        <label className="wide">Adjustment reason<textarea required maxLength={220} rows={2}/></label>
        <p className="form-error wide" role="alert">{error}</p><button className="ad-button primary">Record adjustment</button>
      </form>
    </Modal>}
  </>;
}