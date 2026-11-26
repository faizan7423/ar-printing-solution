"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { demoOrders, orderStatuses, type Order } from "@/data/account";
import { products } from "@/data/catalogue";
import { Photo } from "@/components/ui/Editorial";
import { useCart } from "@/components/shop/CartState";
import { useRouter } from "next/navigation";

export function Reorder({ order }: { order: Order }) {
  const router = useRouter();
  const { save } = useCart();
  return <button className="button outline-button" type="button" onClick={() => {
    save({ productId: order.productId, selection: order.selection, design: order.design });
    router.push("/cart");
  }}>Reorder</button>;
}

export function OrderList({ orders }: { orders: readonly Order[] }) {
  if (!orders.length) return <div className="account-empty"><h3>No orders match</h3><p>Try a different reference, product name or status.</p></div>;
  return <ul className="order-list">{orders.map(order => {
    const product = products.find(item => item.id === order.productId)!;
    return <li key={order.id} className="order-row">
      <div className="photo order-thumb"><Photo id={product.image} alt="" /></div>
      <div><p className="order-ref">{order.id} · {order.date}</p><h3>{product.name}</h3>
        <p>{order.selection.quantity} units</p><span className="order-state">{order.status}</span>
      </div>
      <div className="order-actions"><Link className="textlink" href={"/account/orders/" + order.id}>View Order Details <ArrowUpRight size={16}/></Link><Reorder order={order}/></div>
    </li>;
  })}</ul>;
}

export function Orders() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const visible = demoOrders.filter(order => {
    const name = products.find(product => product.id === order.productId)?.name ?? "";
    return (!status || order.status === status) && (order.id + " " + name).toLowerCase().includes(query.trim().toLowerCase());
  });
  return <><div className="account-heading"><h2>My orders</h2><p>Fictional orders with proposed production statuses.</p></div>
    <div className="order-filters">
      <label>Search orders<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Reference or product name"/></label>
      <label>Order status<select value={status} onChange={event => setStatus(event.target.value)}><option value="">All statuses</option>{orderStatuses.map(value => <option key={value}>{value}</option>)}</select></label>
      <button type="button" className="textlink" onClick={() => { setQuery(""); setStatus(""); }}>Clear filters</button>
    </div>
    <p className="caption" role="status">{visible.length} {visible.length === 1 ? "order" : "orders"}</p><OrderList orders={visible} />
  </>;
}