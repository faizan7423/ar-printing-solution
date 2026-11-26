"use client";

import Link from "next/link";
import { useState } from "react";
import { Printer } from "lucide-react";
import { formatDate, formatMoney, quoteStages, quoteTotals, type QuoteLine, type QuoteStage } from "@/data/admin";
import { useAdmin, note } from "./AdminState";
import { AdminHeading, Badge, Empty, Field, Filter, MissingRecord, Modal, Panel } from "./UI";
import { Notes } from "./Orders";
import { AdminLogo } from "./Logo";

export function Quotations() {
  const { data } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const list = data.quotes.filter(quote => (!status || quote.status === status) &&
    (quote.id + " " + data.customers.find(item => item.id === quote.customerId)?.name + " " + quote.service).toLowerCase().includes(query.trim().toLowerCase()));
  return <><AdminHeading title="Quotations" description="Manage fictional bulk printing enquiries and prepare draft estimates."/>
    <Panel title="Quotation register">
      <div className="ad-filters"><Field label="Search quotations"><input type="search" placeholder="Reference, customer or service" value={query} onChange={event => setQuery(event.target.value)}/></Field>
        <Filter label="Quotation status" value={status} options={quoteStages} onChange={setStatus}/></div>
      {list.length ? <div className="ad-table-wrap" role="region" aria-label="Quotation register" tabIndex={0}><table><thead><tr><th>Reference</th><th>Company / customer</th><th>Printing service</th><th>Qty</th><th>Submitted</th><th>Assigned staff</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{list.map(quote => <tr key={quote.id}>
          <th scope="row"><Link href={"/admin/quotations/" + quote.id}>{quote.id}</Link></th><td>{data.customers.find(item => item.id === quote.customerId)?.name}</td><td>{quote.service}</td>
          <td>{quote.line.quantity}</td><td>{formatDate(quote.date)}</td><td>{data.staff.find(item => item.id === quote.staffId)?.name}</td><td><Badge label={quote.status}/></td>
          <td><Link href={"/admin/quotations/" + quote.id}>Open</Link></td>
        </tr>)}</tbody></table></div> : <Empty title="No quotations match"/>}
    </Panel>
  </>;
}

const numericFields: { key: Exclude<keyof QuoteLine, "description">; label: string; min?: number; max: number; step?: number }[] = [
  { key: "quantity", label: "Quantity", min: 1, max: 99999, step: 1 },
  { key: "unitPrice", label: "Unit price (₹)", max: 999999 },
  { key: "printing", label: "Printing charges (₹)", max: 999999 },
  { key: "extras", label: "Additional charges (₹)", max: 999999 },
  { key: "discount", label: "Discount (₹)", max: 999999 },
  { key: "tax", label: "Tax (%)", max: 100 },
];

export function QuoteDetails({ id }: { id: string }) {
  const { data } = useAdmin();
  const quote = data.quotes.find(quote => quote.id === id);
  return quote ? <QuoteEditor key={quote.id} id={quote.id} initial={quote.line}/> : <MissingRecord type="Quotation" back="/admin/quotations"/>;
}

function QuoteEditor({ id, initial }: { id: string; initial: QuoteLine }) {
  const { data, update } = useAdmin();
  const quote = data.quotes.find(quote => quote.id === id)!;
  const customer = data.customers.find(item => item.id === quote.customerId);
  const [line, setLine] = useState(initial);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const totals = quoteTotals(line);
  function save() {
    update(current => ({ ...current, quotes: current.quotes.map(entry => entry.id === id ? { ...entry, line } : entry) }));
    setMessage("Demo estimate saved.");
  }
  const totalRows = [["Subtotal", totals.subtotal], ["Discount", line.discount], ["Tax", totals.tax], ["Estimated total", totals.total]] as const;
  return <><AdminHeading title={quote.id} description={"Demo quotation · " + formatDate(quote.date)}
    actions={<><Badge label={quote.status}/><Link className="ad-button secondary" href="/admin/quotations">All quotations</Link></>}/>
    <div className="ad-grid-two">
      <Panel title="Printing requirements"><dl className="ad-info">
        <div><dt>Customer</dt><dd>{customer && <Link className="ad-link" href={"/admin/customers/" + customer.id}>{customer.name}</Link>}</dd></div>
        <div><dt>Email</dt><dd>{customer?.email}</dd></div><div><dt>Phone</dt><dd>{customer?.phone}</dd></div>
        <div><dt>Service</dt><dd>{quote.service}</dd></div><div><dt>Garment</dt><dd>{quote.garment}</dd></div><div><dt>Fabric</dt><dd>{quote.fabric}</dd></div><div><dt>Artwork</dt><dd>{quote.artwork}</dd></div>
      </dl></Panel>
      <Panel title="Assignment & status"><div className="ad-form-grid">
        <Field label="Quotation status"><select value={quote.status} onChange={event => {
          const status = event.target.value as QuoteStage;
          update(current => ({ ...current, quotes: current.quotes.map(entry => entry.id === id ? { ...entry, status } : entry) }));
          setMessage(status === "Quotation Sent" ? "Status recorded for the demo. No quotation or email was sent." : "Quotation status updated.");
        }}>{quoteStages.map(stage => <option key={stage}>{stage}</option>)}</select></Field>
        <Field label="Assigned staff"><select value={quote.staffId} onChange={event => {
          const staffId = event.target.value;
          update(current => ({ ...current, quotes: current.quotes.map(entry => entry.id === id ? { ...entry, staffId } : entry) }));
        }}>{data.staff.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
      </div></Panel>
    </div>
    <Panel title="Quotation builder">
      <form className="ad-form" onSubmit={event => {
        event.preventDefault();
        const intent = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
        if (!line.description.trim() || line.discount > totals.subtotal) { setMessage("Add a description and keep discount within the subtotal."); return; }
        if (intent === "preview") setPreview(true); else save();
      }}>
        <label className="wide">Service description<input required maxLength={180} value={line.description} onChange={event => setLine({ ...line, description: event.target.value })}/></label>
        {numericFields.map(({ key, label, min = 0, max, step = .01 }) => <Field key={key} label={label}><input type="number" required min={min} max={max} step={step}
          value={line[key]} onChange={event => setLine({ ...line, [key]: Number(event.target.value) })}/></Field>)}
        <dl className="ad-info wide" aria-live="polite">{totalRows.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{formatMoney(value)}</dd></div>)}</dl>
        <div className="ad-actions wide"><button className="ad-button primary" value="save">Save estimate</button><button className="ad-button secondary" value="preview">Preview quotation</button></div>
        <p className="wide" role="status">{message}</p>
      </form>
    </Panel>
    <Notes notes={quote.notes} onAdd={text => update(current => ({ ...current, quotes: current.quotes.map(entry => entry.id === id ? { ...entry, notes: [...entry.notes, note(text)] } : entry) }))}/>
    {preview && <Modal title="Demo quotation preview" close={() => setPreview(false)}>
      <div className="ad-print-quote">
        <AdminLogo/><h3>Demo quotation {id}</h3><p>{customer?.name} · {formatDate(quote.date)}</p>
        <p>{line.description} · {line.quantity} units at {formatMoney(line.unitPrice)} per unit</p>
        <p>Printing {formatMoney(line.printing)} · Additional charges {formatMoney(line.extras)}</p>
        <dl className="ad-info">{totalRows.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{formatMoney(value)}</dd></div>)}</dl>
        <p>Illustrative estimate. Pricing and tax inputs are subject to business approval.</p>
      </div>
      <button className="ad-button secondary ad-spaced ad-no-print" type="button" onClick={() => window.print()}><Printer size={16}/> Print demo preview</button>
    </Modal>}
  </>;
}