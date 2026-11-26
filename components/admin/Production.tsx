"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { allowedOrderStages, formatDate, type OrderStage } from "@/data/admin";
import { useAdmin } from "./AdminState";
import { AdminHeading, Badge, Empty } from "./UI";
import { nextProductionStatus } from "./Orders";

const lanes: { name: string; stages: OrderStage[] }[] = [
  { name: "Awaiting artwork approval", stages: ["Order Received", "Artwork Review", "Awaiting Customer Approval"] },
  { name: "Ready for production", stages: ["Approved", "Production Queue"] },
  { name: "Printing", stages: ["Printing in Progress"] },
  { name: "Quality check", stages: ["Quality Check"] },
  { name: "Packing", stages: ["Packed"] },
  { name: "Completed", stages: ["Shipped", "Delivered"] },
];

export function Production() {
  const { data, transitionOrder, update } = useAdmin();
  return <><AdminHeading title="Production queue" description="Proposed production stages and due dates for fictional orders."/>
    <div className="ad-board" role="region" aria-label="Production board" tabIndex={0}>{lanes.map(lane => {
      const orders = data.orders.filter(order => lane.stages.includes(order.status));
      return <section className="ad-lane" key={lane.name}><h2>{lane.name}<span>{orders.length}</span></h2>
        {orders.length ? orders.map(order => {
          const next = nextProductionStatus(order);
          const art = data.artwork.find(art => art.orderId === order.id);
          return <article className="ad-task" key={order.id}><div className="ad-task-head"><Link className="ad-link" href={"/admin/orders/" + order.id}>{order.id}</Link><Badge label={order.task.priority}/></div>
            <h3>{order.item.productName}</h3><p>{order.item.quantity} units · {order.item.method}</p><p>Proposed due {formatDate(order.task.due)}</p>
            <label>Assigned staff<select value={order.task.staffId} onChange={event => {
              const staffId = event.target.value;
              update(current => ({ ...current, orders: current.orders.map(item => item.id === order.id ? { ...item, task: { ...item.task, staffId } } : item) }));
            }}>{data.staff.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <div className="ad-task-head"><Badge label={order.status}/></div>
            {next && allowedOrderStages(order, data.artwork).includes(next) ? <button type="button" className="ad-button secondary" onClick={() => transitionOrder(order.id, next)}>Move to {next} <ArrowRight size={14}/></button> :
              art && lane === lanes[0] && <Link className="ad-link" href={"/admin/artwork/" + art.id}>Open artwork</Link>}
          </article>;
        }) : <Empty title="No orders"/>}
      </section>;
    })}</div>
  </>;
}