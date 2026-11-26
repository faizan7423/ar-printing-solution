import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Circle, CircleDot, ChevronLeft } from "lucide-react";
import { demoAddresses, demoOrders, orderStatuses } from "@/data/account";
import { products } from "@/data/catalogue";
import { DesignPreview } from "@/components/account/DesignPreview";
import { Reorder } from "@/components/account/Orders";

export const metadata = { title: "Order Details" };

export function generateStaticParams() {
  return demoOrders.map(order => ({ id: order.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = demoOrders.find(order => order.id === id);
  if (!order) notFound();
  const product = products.find(item => item.id === order.productId)!;
  const step = orderStatuses.indexOf(order.status);
  const address = demoAddresses[0];

  return <>
    <Link className="textlink" href="/account/orders"><ChevronLeft size={16}/> My Orders</Link>
    <div className="account-heading"><h2>Order {order.id}</h2><p>Sample order · {order.date}</p></div>
    <div className="account-order-detail">
      <section className="account-card">
        <h3>{product.name}</h3>
        <DesignPreview product={product} selection={order.selection} design={order.design}/>
        <dl className="account-facts">
          <div><dt>Size</dt><dd>{order.selection.size}</dd></div><div><dt>Colour</dt><dd>{order.selection.colour.name}</dd></div>
          <div><dt>Quantity</dt><dd>{order.selection.quantity}</dd></div><div><dt>Print placement</dt><dd>{order.selection.placement}</dd></div>
          <div><dt>Artwork approval</dt><dd>{step > 2 ? "Approved in sample order" : "Awaiting sample approval"}</dd></div>
          <div><dt>Payment</dt><dd>Demo placeholder</dd></div>
        </dl>
      </section>
      <section className="account-card"><h3>Order timeline</h3><p>Proposed stages shown for this fictional order.</p>
        <ol className="order-timeline">{orderStatuses.map((status, index) => <li key={status} aria-current={step === index ? "step" : undefined}>
          {index < step ? <Check size={18} aria-hidden="true" /> : index === step ? <CircleDot size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}
          <span>{status}</span><span className="caption">{index < step ? "Complete" : index === step ? "Current" : "Upcoming"}</span>
        </li>)}</ol>
      </section>
    </div>
    <section className="account-card order-delivery"><h3>Fictional delivery information</h3>
      <address>{address.recipient}<br/>{address.street}<br/>{address.city}, {address.postal}</address>
      <p>Tracking is a preview of proposed order stages.</p>
      <div className="order-actions"><Reorder order={order}/><Link className="textlink" href="/#contact">Contact Support</Link></div>
    </section>
  </>;
}