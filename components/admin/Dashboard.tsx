"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, Boxes, ClipboardList, FileText, Image, IndianRupee, Package, UsersRound } from "lucide-react";
import { formatMoney, orderStages, type AdminData, type Order } from "@/data/admin";
import { useAdmin } from "./AdminState";
import { AdminHeading, Badge, Empty, Field, Panel } from "./UI";
import { OrdersTable } from "./Orders";

export const productionStages = ["Production Queue", "Printing in Progress", "Quality Check", "Packed"];
const periodStart: Record<string, string> = { "7": "2026-11-20", "30": "2026-10-28", "90": "2026-08-29" };
const reviewStages = ["Pending Review", "Under Review", "Revision Required", "Awaiting Customer Approval"];

export function Bars({ data, format = String }: { data: { label: string; value: number }[]; format?: (value: number) => string }) {
  if (!data.length || !data.some(item => item.value)) return <Empty title="No data in this period"/>;
  const max = Math.max(...data.map(item => item.value), 1);
  return <ul className="ad-bars">{data.map(item => <li key={item.label}>
    <div><span>{item.label}</span><strong>{format(item.value)}</strong></div>
    <div className="ad-bar-track" aria-hidden="true"><span style={{ width: (item.value / max * 100) + "%" }}/></div>
  </li>)}</ul>;
}

function Trend({ data, currency }: { data: { label: string; value: number }[]; currency?: boolean }) {
  const max = Math.max(...data.map(item => item.value), 1);
  const format = currency ? formatMoney : String;
  if (!data.length) return <Empty title="No data in this period"/>;
  return <div className="ad-trend" role="img" aria-label={data.map(item => item.label + " " + format(item.value)).join(", ")}>
    {data.map(item => <div className="ad-trend-col" key={item.label}><strong>{format(item.value)}</strong><div><span style={{ height: (item.value / max * 100) + "%" }}/></div><span>{item.label}</span></div>)}
  </div>;
}

export function countBy<T>(items: readonly T[], key: (item: T) => string, weight: (item: T) => number = () => 1) {
  const groups = new Map<string, number>();
  for (const item of items) { const label = key(item); groups.set(label, (groups.get(label) ?? 0) + weight(item)); }
  return Array.from(groups, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function trends(orders: Order[], period: string, paid: boolean) {
  const buckets = period === "7" ? ["2026-11-20", "2026-11-22", "2026-11-24", "2026-11-26"] :
    period === "30" ? ["2026-10-28", "2026-11-04", "2026-11-11", "2026-11-18", "2026-11-25"] : ["2026-09-01", "2026-10-01", "2026-11-01"];
  return buckets.map((bucket, index) => {
    const entries = orders.filter(order => order.date >= bucket && (!buckets[index + 1] || order.date < buckets[index + 1]));
    return { label: new Intl.DateTimeFormat("en-GB", { month: "short", ...(period === "90" ? {} : { day: "numeric" }), timeZone: "UTC" }).format(new Date(bucket)),
      value: paid ? totalPaid(entries) : entries.length };
  });
}

function totalPaid(orders: Order[]) { return orders.filter(order => order.payment === "Paid" && order.status !== "Cancelled").reduce((sum, order) => sum + order.item.value, 0); }

export function Dashboard({ analytics = false }: { analytics?: boolean }) {
  const { data } = useAdmin();
  const [period, setPeriod] = useState("90");
  const orders = data.orders.filter(order => order.date >= periodStart[period]);
  const activeOrderIds = new Set(orders.filter(order => order.status !== "Cancelled").map(order => order.id));
  const artwork = data.artwork.filter(item => (!item.orderId || activeOrderIds.has(item.orderId)) && reviewStages.includes(item.status));
  const quotes = data.quotes.filter(quote => quote.date >= periodStart[period]);
  const newQuotes = quotes.filter(quote => quote.status === "New");
  const low = data.variants.filter(variant => variant.active && variant.available <= variant.threshold && data.products.some(product => product.id === variant.productId && product.status !== "Archived"));
  const pending = orders.filter(order => orderStages.indexOf(order.status) <= orderStages.indexOf("Approved"));
  const inProduction = orders.filter(order => productionStages.includes(order.status));
  const revenue = totalPaid(orders);
  const paidCount = orders.filter(order => order.payment === "Paid" && order.status !== "Cancelled").length;
  const conversion = quotes.length ? (quotes.filter(quote => quote.status === "Accepted").length / quotes.length * 100).toFixed(1) + "%" : "0%";
  const metrics = [
    ["Total Revenue", formatMoney(revenue), IndianRupee], ["Total Orders", orders.length, ClipboardList], ["Pending Orders", pending.length, Package],
    ["Orders in Production", inProduction.length, Activity], ["Pending Artwork Approvals", artwork.length, Image], ["New Quotations", newQuotes.length, FileText],
    ["Low Stock Products", new Set(low.map(item => item.productId)).size, Boxes], ["Total Customers", data.customers.length, UsersRound],
  ] as const;

  return <><AdminHeading title={analytics ? "Analytics" : "Operations overview"} description={analytics ? "Explore the fictional sales and production dataset." : "Monitor sales, artwork and the production floor."}
    actions={<Field label="Demo reporting period"><select value={period} onChange={event => setPeriod(event.target.value)}><option value="7">Last 7 sample days</option><option value="30">Last 30 sample days</option><option value="90">Last 90 sample days</option></select></Field>}/>
    {analytics ? <div className="ad-kpis">
      <div><span>Paid revenue</span><strong>{formatMoney(revenue)}</strong></div><div><span>Average paid order</span><strong>{formatMoney(paidCount ? revenue / paidCount : 0)}</strong></div>
      <div><span>Quotation conversion</span><strong>{conversion}</strong></div><div><span>Orders in period</span><strong>{orders.length}</strong></div>
    </div> : <div className="ad-kpis">{metrics.map(([label, value, Icon]) => <div key={label}><span>{label}<Icon size={17}/></span><strong>{value}</strong></div>)}</div>}
    <div className="ad-grid-two">
      <Panel title="Revenue trend"><Trend currency data={trends(orders, period, true)}/></Panel><Panel title="Order volume"><Trend data={trends(orders, period, false)}/></Panel>
      <Panel title="Orders by status"><Bars data={countBy(orders, order => order.status)}/></Panel>
      <Panel title={analytics ? "Product popularity by units" : "Popular categories by units"}><Bars data={countBy(orders.filter(order => order.status !== "Cancelled"), order => analytics ? order.item.productName : categoryName(data, order), order => order.item.quantity)}/></Panel>
    </div>
    {analytics ? <div className="ad-grid-two">
      <Panel title="Printing method demand"><Bars data={countBy(orders, order => order.item.method)}/></Panel>
      <Panel title="Retail vs. B2B orders"><Bars data={countBy(orders, order => data.customers.find(item => item.id === order.customerId)?.type === "Business" ? "B2B" : "Retail")}/></Panel>
    </div> : <>
      <Panel title="Recent orders" actions={<Link className="ad-link" href="/admin/orders">View all orders <ArrowUpRight size={14}/></Link>}><OrdersTable orders={orders.slice(0, 5)} data={data} compact/></Panel>
      <div className="ad-grid-two">
        <Panel title="Pending artwork approvals" actions={<Link className="ad-link" href="/admin/artwork">Review queue</Link>}><DashboardList items={artwork.slice(0, 4).map(item => [item.id, item.orderId ?? "Studio design", item.status, "/admin/artwork/" + item.id])}/></Panel>
        <Panel title="New quotations" actions={<Link className="ad-link" href="/admin/quotations">Open quotations</Link>}><DashboardList items={newQuotes.map(item => [item.id, item.service, item.status, "/admin/quotations/" + item.id])}/></Panel>
        <Panel title="Low-stock alerts" actions={<Link className="ad-link" href="/admin/inventory">View inventory</Link>}><DashboardList items={low.slice(0, 5).map(item => [item.sku, item.colour + " · " + item.size, item.available + " available", "/admin/inventory"])}/></Panel>
        <Panel title="Production queue summary" actions={<Link className="ad-link" href="/admin/production">Open production board</Link>}><Bars data={countBy(inProduction, order => order.status)}/></Panel>
      </div>
    </>}
  </>;
}

function categoryName(data: AdminData, order: Order) {
  const id = data.products.find(product => product.id === order.item.productId)?.categoryId;
  return data.categories.find(category => category.id === id)?.name ?? "Unassigned";
}

function DashboardList({ items }: { items: string[][] }) {
  return items.length ? <ul className="ad-dashboard-list">{items.map(([id, description, status, href]) => <li key={id}><div><Link className="ad-link" href={href}>{id}</Link><p>{description}</p></div><Badge label={status}/></li>)}</ul> : <Empty title="No matching records"/>;
}