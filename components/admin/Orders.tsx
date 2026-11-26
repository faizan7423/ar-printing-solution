"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Download } from "lucide-react";
import { allowedOrderStages, artworkStages, formatDate, formatMoney, orderStages, paymentStates, type AdminData, type Note, type Order, type OrderStage } from "@/data/admin";
import { useAdmin, note } from "./AdminState";
import { AdminHeading, Badge, Confirm, Empty, Field, Filter, MissingRecord, Panel } from "./UI";
import { ProofPreview } from "./ProofPreview";

export function OrdersTable({ orders, data, compact = false }: { orders: Order[]; data: AdminData; compact?: boolean }) {
  if (!orders.length) return <Empty title="No orders match">Adjust your filters to see more orders.</Empty>;
  return <div className="ad-table-wrap" tabIndex={0} role="region" aria-label="Orders table"><table><thead><tr>
    <th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Product</th><th scope="col">Qty</th><th scope="col">Date</th><th scope="col">Value</th>
    {!compact && <><th scope="col">Payment</th><th scope="col">Artwork</th></>}<th scope="col">Production status</th><th scope="col">Action</th>
  </tr></thead><tbody>{orders.map(order => {
    const artwork = data.artwork.find(item => item.orderId === order.id);
    return <tr key={order.id}><th scope="row"><Link href={"/admin/orders/" + order.id}>{order.id}</Link></th><td>{data.customers.find(customer => customer.id === order.customerId)?.name}</td>
      <td>{order.item.productName}</td><td>{order.item.quantity}</td><td>{formatDate(order.date)}</td><td>{formatMoney(order.item.value)}</td>
      {!compact && <><td><Badge label={order.payment}/></td><td><Badge label={artwork?.status ?? "No artwork"}/></td></>}
      <td><Badge label={order.status}/></td><td><Link aria-label={"View " + order.id} href={"/admin/orders/" + order.id}>View</Link></td>
    </tr>;
  })}</tbody></table></div>;
}

function exportOrders(orders: Order[], data: AdminData) {
  const cell = (input: string | number) => {
    const value = String(input);
    const safe = typeof input === "string" && /^[\s=+\-@]/.test(value) ? "'" + value : value;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  const header = ["Demo order", "Customer", "Product", "Quantity", "Date", "Demo value (INR)", "Payment", "Artwork", "Production status"];
  const rows = orders.map(order => [order.id, data.customers.find(customer => customer.id === order.customerId)?.name ?? "", order.item.productName, order.item.quantity,
    order.date, order.item.value, order.payment, data.artwork.find(art => art.orderId === order.id)?.status ?? "", order.status]);
  const url = URL.createObjectURL(new Blob([[header, ...rows].map(row => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const download = document.createElement("a");
  download.href = url;
  download.download = "ar-demo-orders.csv";
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Orders() {
  const { data } = useAdmin();
  const initialFilters = { query: "", status: "", payment: "", artwork: "", from: "", to: "", sort: "recent" };
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  function filter(name: keyof typeof filters, value: string) { setFilters(current => ({ ...current, [name]: value })); setPage(1); }
  const orders = data.orders.filter(order => {
    const name = data.customers.find(customer => customer.id === order.customerId)?.name ?? "";
    return (order.id + " " + name).toLowerCase().includes(filters.query.toLowerCase().trim()) &&
      (!filters.status || order.status === filters.status) && (!filters.payment || order.payment === filters.payment) &&
      (!filters.artwork || data.artwork.some(art => art.orderId === order.id && art.status === filters.artwork)) &&
      (!filters.from || order.date >= filters.from) && (!filters.to || order.date <= filters.to);
  }).sort((a, b) => filters.sort === "value" ? b.item.value - a.item.value : filters.sort === "oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  const pages = Math.max(1, Math.ceil(orders.length / 7));
  const activePage = Math.min(page, pages);

  return <><AdminHeading title="Orders" description="Review demo orders and advance approved production work." actions={<button className="ad-button secondary" type="button" disabled={!orders.length} onClick={() => exportOrders(orders, data)}><Download size={16}/> Export CSV</button>}/>
    <Panel title="Order register">
      <div className="ad-filters">
        <Field label="Search orders"><input type="search" placeholder="Order ID or customer" value={filters.query} onChange={event => filter("query", event.target.value)}/></Field>
        <Filter label="Order status" value={filters.status} options={orderStages} onChange={value => filter("status", value)}/>
        <Filter label="Payment" value={filters.payment} options={paymentStates} onChange={value => filter("payment", value)}/>
        <Filter label="Artwork" value={filters.artwork} options={artworkStages} onChange={value => filter("artwork", value)}/>
        <Field label="From"><input type="date" max={filters.to || undefined} value={filters.from} onChange={event => filter("from", event.target.value)}/></Field>
        <Field label="To"><input type="date" min={filters.from || undefined} value={filters.to} onChange={event => filter("to", event.target.value)}/></Field>
        <Field label="Sort by"><select value={filters.sort} onChange={event => filter("sort", event.target.value)}><option value="recent">Newest first</option><option value="oldest">Oldest first</option><option value="value">Highest value</option></select></Field>
        <button className="ad-button secondary" type="button" onClick={() => { setFilters(initialFilters); setPage(1); }}>Clear filters</button>
      </div>
      <OrdersTable orders={orders.slice((activePage - 1) * 7, activePage * 7)} data={data}/>
      <div className="ad-pager"><span role="status">{orders.length} demo orders · Page {activePage} of {pages}</span><div className="ad-actions">
        <button className="ad-button secondary" type="button" disabled={activePage === 1} onClick={() => setPage(activePage - 1)}>Previous</button>
        <button className="ad-button secondary" type="button" disabled={activePage === pages} onClick={() => setPage(activePage + 1)}>Next</button>
      </div></div>
    </Panel>
  </>;
}

export function Notes({ notes, onAdd, label = "Internal notes" }: { notes: Note[]; onAdd: (text: string) => void; label?: string }) {
  const [message, setMessage] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    onAdd(message);
    setMessage("");
  }
  return <Panel title={label}>
    {notes.length ? <ul className="ad-notes">{notes.map((entry, i) => <li key={entry.date + i}><time dateTime={entry.date}>{formatDate(entry.date)}</time><p>{entry.text}</p></li>)}</ul> : <p>No notes for this record.</p>}
    <form className="ad-form" onSubmit={submit}><label className="wide">New demo note<textarea required rows={2} maxLength={600} value={message} onChange={event => setMessage(event.target.value)}/></label>
      <button className="ad-button secondary">Add note</button></form>
  </Panel>;
}

export function OrderDetails({ id }: { id: string }) {
  const { data, transitionOrder, update } = useAdmin();
  const order = data.orders.find(row => row.id === id);
  if (!order) return <MissingRecord type="Order" back="/admin/orders"/>;
  const customer = data.customers.find(item => item.id === order.customerId);
  const art = data.artwork.find(art => art.orderId === id);
  const next = allowedOrderStages(order, data.artwork);
  const details = [["Product", order.item.productName], ["Colour", order.item.colour], ["Size", order.item.size], ["Quantity", order.item.quantity], ["Printing method", order.item.method], ["Demo value", formatMoney(order.item.value)]];
  return <><AdminHeading title={order.id} description={"Demo order · " + formatDate(order.date)} actions={<><Badge label={order.status}/><Link className="ad-button secondary" href="/admin/orders">All orders</Link></>}/>
    <div className="ad-grid-two">
      <Panel title="Order summary"><dl className="ad-info">{details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></Panel>
      <Panel title="Customer, delivery & payment"><dl className="ad-info">
        <div><dt>Customer</dt><dd>{customer && <Link className="ad-link" href={"/admin/customers/" + customer.id}>{customer.name}</Link>}</dd></div><div><dt>Email</dt><dd>{customer?.email}</dd></div><div><dt>Phone</dt><dd>{customer?.phone}</dd></div>
        <div><dt>Sample address</dt><dd>{order.delivery}</dd></div><div><dt>Payment status</dt><dd><Badge label={order.payment}/></dd></div><div><dt>Order value</dt><dd>{formatMoney(order.item.value)}</dd></div>
      </dl></Panel>
    </div>
    <Panel title="Production status">
      <p>Use the next available stage. Artwork approval is required before entering production.</p>
      <div className="ad-actions ad-spaced">{next.filter(stage => stage !== "Cancelled").map(stage => <button key={stage} className="ad-button primary" type="button" onClick={() => transitionOrder(id, stage)}>Move to {stage}</button>)}
        {next.includes("Cancelled") && <Confirm label="Cancel demo order" title="Cancel this demo order?" detail="This closes the order in the current demo session." onConfirm={() => transitionOrder(id, "Cancelled")}/>}
        {!next.length && <Badge label={order.status}/>}
        {art && <Link className="ad-button secondary" href={"/admin/artwork/" + art.id}>Review artwork</Link>}
      </div>
    </Panel>
    <div className="ad-grid-two">
      {art && <Panel title="Artwork & garment proof" actions={<Badge label={art.status}/>}>
        <ProofPreview item={art}/><p>{art.placement} · {art.method} · {art.design.front.length + art.design.back.length} design layers</p>
        <ul className="ad-notes">{[...art.design.front, ...art.design.back].map((layer, index) => <li key={layer.id + index}>{layer.kind === "image" ? layer.file.name : "Illustrative text artwork"}</li>)}</ul>
      </Panel>}
      <Panel title="Order timeline"><ol className="ad-timeline">{[...order.timeline].reverse().map((entry, index) => <li key={entry.date + index}><strong>{entry.status}</strong><time dateTime={entry.date}>{formatDate(entry.date)}</time></li>)}</ol></Panel>
    </div>
    <Notes notes={order.notes} onAdd={text => update(current => ({ ...current, orders: current.orders.map(entry => entry.id === id ? { ...entry, notes: [...entry.notes, note(text)] } : entry) }))}/>
  </>;
}

export function nextProductionStatus(order: Order): OrderStage | undefined {
  const index = orderStages.indexOf(order.status);
  return index >= orderStages.indexOf("Approved") && index < orderStages.indexOf("Delivered") ? orderStages[index + 1] : undefined;
}