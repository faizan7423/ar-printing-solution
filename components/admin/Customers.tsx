"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/data/admin";
import { useAdmin, note } from "./AdminState";
import { AdminHeading, Badge, Empty, Field, Filter, MissingRecord, Panel } from "./UI";
import { Notes, OrdersTable } from "./Orders";

export function Customers() {
  const { data } = useAdmin();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const list = data.customers.filter(item => (!type || type === item.type) && (!status || status === item.status) &&
    (item.name + " " + item.email).toLowerCase().includes(query.trim().toLowerCase()));
  return <><AdminHeading title="Customers" description="Fictional individual and business records linked to orders and quotations."/>
    <Panel title="Customer register"><div className="ad-filters">
      <Field label="Search customers"><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Customer name or email"/></Field>
      <Filter label="Customer type" options={["Individual", "Business"]} value={type} onChange={setType}/>
      <Filter label="Customer status" options={["Active", "Inactive"]} value={status} onChange={setStatus}/>
    </div>
    {list.length ? <div className="ad-table-wrap" tabIndex={0} role="region" aria-label="Customer register"><table><thead><tr><th>Name</th><th>Type</th><th>Demo email</th><th>Demo phone</th><th>Orders</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{list.map(item => <tr key={item.id}><th scope="row"><Link href={"/admin/customers/" + item.id}>{item.name}</Link></th><td>{item.type}</td><td>{item.email}</td><td>{item.phone}</td>
        <td>{data.orders.filter(order => order.customerId === item.id).length}</td><td><Badge label={item.status}/></td><td><Link href={"/admin/customers/" + item.id}>View</Link></td>
      </tr>)}</tbody></table></div> : <Empty title="No customers match"/>}
    </Panel>
  </>;
}

export function CustomerDetails({ id }: { id: string }) {
  const { data, update } = useAdmin();
  const customer = data.customers.find(item => item.id === id);
  if (!customer) return <MissingRecord type="Customer" back="/admin/customers"/>;
  const orders = data.orders.filter(item => item.customerId === id);
  const quotes = data.quotes.filter(item => item.customerId === id);
  const linkedDesigns = data.artwork.filter(item => item.orderId && orders.some(order => order.id === item.orderId));
  return <><AdminHeading title={customer.name} description={customer.id + " · Fictional " + customer.type.toLowerCase() + " customer"} actions={<Link href="/admin/customers" className="ad-button secondary">All customers</Link>}/>
    <div className="ad-grid-two">
      <Panel title="Customer details"><dl className="ad-info">
        <div><dt>Email</dt><dd>{customer.email}</dd></div><div><dt>Phone</dt><dd>{customer.phone}</dd></div><div><dt>Customer type</dt><dd>{customer.type}</dd></div>
        <div><dt>Total orders</dt><dd>{orders.length}</dd></div>
      </dl><label className="ad-spaced">Customer status<select value={customer.status} onChange={event => {
        const status = event.target.value as "Active" | "Inactive";
        update(current => ({ ...current, customers: current.customers.map(item => item.id === id ? { ...item, status } : item) }));
      }}><option>Active</option><option>Inactive</option></select></label></Panel>
      <Panel title="Saved design summary">
        <p>{linkedDesigns.length} artwork records are attached to this fictional customer’s orders.</p>
        {linkedDesigns.length ? <ul className="ad-dashboard-list">{linkedDesigns.map(item => <li key={item.id}><Link className="ad-link" href={"/admin/artwork/" + item.id}>{item.id} · {item.placement}</Link><Badge label={item.status}/></li>)}</ul> : <Empty title="No attached artwork"/>}
      </Panel>
    </div>
    <Panel title="Order history"><OrdersTable compact orders={orders} data={data}/></Panel>
    <Panel title="Quotations">{quotes.length ? <ul className="ad-dashboard-list">{quotes.map(quote => <li key={quote.id}>
      <Link className="ad-link" href={"/admin/quotations/" + quote.id}>{quote.id} · {quote.service}</Link><span>{formatDate(quote.date)}</span><Badge label={quote.status}/>
    </li>)}</ul> : <Empty title="No quotations"/>}</Panel>
    <Notes label="Customer notes" notes={customer.notes} onAdd={text => update(current => ({ ...current, customers: current.customers.map(item => item.id === id ? { ...item, notes: [...item.notes, note(text)] } : item) }))}/>
  </>;
}