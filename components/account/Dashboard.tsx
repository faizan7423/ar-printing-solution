"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, ImagePlus, MapPin, Package } from "lucide-react";
import { demoOrders } from "@/data/account";
import { useAccount } from "./AccountState";
import { OrderList } from "./Orders";

export function Dashboard() {
  const { profile, designs, addresses, wishlist } = useAccount();
  const shortcuts = [
    { name: "Order history", count: demoOrders.length, href: "/account/orders", Icon: Package },
    { name: "Saved designs", count: designs.length, href: "/account/designs", Icon: ImagePlus },
    { name: "Saved addresses", count: addresses.length, href: "/account/addresses", Icon: MapPin },
    { name: "Wishlist", count: wishlist.length, href: "/account/wishlist", Icon: Heart },
  ];
  return <>
    <div className="account-heading"><h2>Hello, {profile.name}.</h2><p>Review print progress and manage your designs, addresses and favourite products.</p></div>
    <div className="account-shortcuts">{shortcuts.map(({ name, count, href, Icon }) => <Link href={href} key={href}>
      <Icon size={22}/><strong>{count}</strong><span>{name}<ArrowUpRight size={16}/></span>
    </Link>)}</div>
    <div className="account-section-title"><h3>Recent orders</h3><Link className="textlink" href="/account/orders">View all orders <ArrowUpRight size={16}/></Link></div>
    <OrderList orders={demoOrders} />
  </>;
}