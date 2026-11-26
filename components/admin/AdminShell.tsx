"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Bell, ChevronDown, ChevronRight, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { adminLinks, adminNav, approvedAdminReturn } from "./navigation";
import { useAdmin } from "./AdminState";
import { AdminLogo } from "./Logo";
import { Empty, Modal } from "./UI";

function SideBar({ path, compact, onNavigate }: { path: string; compact?: boolean; onNavigate?: () => void }) {
  return <nav className="ad-nav" aria-label="Admin navigation">{adminNav.map(group => <div key={group.label}>
    {!compact && <p>{group.label}</p>}
    {group.entries.map(({ label, href, Icon }) => {
      const active = path === href || (href !== "/admin" && path.startsWith(href + "/"));
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} aria-label={label} title={label} onClick={onNavigate}><Icon size={18}/>{!compact && <span>{label}</span>}</Link>;
    })}
  </div>)}</nav>;
}

function GlobalSearch({ close }: { close: () => void }) {
  const { data } = useAdmin();
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const entries = [
    ...adminLinks,
    ...data.orders.map(order => ({ label: order.id + " · " + order.item.productName, href: "/admin/orders/" + order.id })),
    ...data.artwork.map(art => ({ label: art.id + " · " + (art.orderId ?? "Studio proof"), href: "/admin/artwork/" + art.id })),
    ...data.quotes.map(quote => ({ label: quote.id + " · " + quote.service, href: "/admin/quotations/" + quote.id })),
    ...data.products.map(product => ({ label: product.name + " · " + product.sku, href: "/admin/products/" + product.id + "/edit" })),
    ...data.customers.map(customer => ({ label: customer.name, href: "/admin/customers/" + customer.id })),
  ];
  const results = (term ? entries.filter(entry => entry.label.toLowerCase().includes(term)) : adminLinks).slice(0, 12);
  return <Modal title="Search the workspace" close={close}><label>Search pages and records<input type="search" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Try DEMO-2082 or Quotations"/></label>
    {results.length ? <ul className="ad-search-results">{results.map(entry => <li key={entry.href}><Link href={entry.href} onClick={close}>{entry.label}<ChevronRight size={16}/></Link></li>)}</ul> : <Empty title="No matching records"/>}
  </Modal>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { signedIn, data, signOut, resetToken } = useAdmin();
  const path = usePathname();
  const router = useRouter();
  const [compact, setCompact] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [flyout, setFlyout] = useState<"profile" | "alerts" | null>(null);
  const alertButton = useRef<HTMLButtonElement>(null);
  const profileButton = useRef<HTMLButtonElement>(null);
  const activePage = adminLinks.find(item => item.href !== "/admin" && (path === item.href || path.startsWith(item.href + "/")));
  const pending = data.artwork.filter(item => item.status === "Pending Review").length;
  const newQuotes = data.quotes.filter(item => item.status === "New").length;

  if (!signedIn) return <main className="ad-guard"><AdminLogo/><div className="ad-kicker">ADMIN DEMONSTRATION</div><h1>Admin sign-in required</h1>
    <p>Open the separate demo admin session to explore this workspace.</p>
    <Link className="ad-button primary" href={"/admin/sign-in?next=" + encodeURIComponent(approvedAdminReturn(path))}>Go to Admin Sign-In</Link>
    <Link className="ad-link" href="/">View Storefront</Link>
  </main>;

  function logOut() { setFlyout(null); signOut(); router.replace("/admin/sign-in"); }
  return <div className={"ad-shell" + (compact ? " ad-is-compact" : "")}>
    <a className="skip" href="#admin-content">Skip to admin content</a>
    <aside className="ad-sidebar">
      <Link href="/admin" className="ad-sidebar-brand"><AdminLogo/>{!compact && <span>AR Printing<strong>Operations</strong></span>}</Link>
      <SideBar path={path} compact={compact}/>
      <Link className="ad-store-link" href="/" aria-label="View Storefront" title="View Storefront"><ArrowUpRight size={17}/>{!compact && "View Storefront"}</Link>
    </aside>
    <div className="ad-main">
      <header className="ad-topbar">
        <button className="ad-icon ad-collapse" type="button" onClick={() => setCompact(!compact)} aria-label={compact ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!compact}>{compact ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>}</button>
        <button className="ad-icon ad-mobile-trigger" type="button" onClick={() => setDrawer(true)} aria-label="Open admin navigation"><Menu size={21}/></button>
        <nav aria-label="Breadcrumb" className="ad-breadcrumb"><Link href="/admin">Admin</Link><ChevronRight size={14}/>{activePage ? <Link href={activePage.href}>{activePage.label}</Link> : <span aria-current="page">Dashboard</span>}{activePage && path !== activePage.href && <><ChevronRight size={14}/><span aria-current="page">{path.endsWith("/new") ? "New" : path.endsWith("/edit") ? "Edit" : path.split("/").at(-1)}</span></>}</nav>
        <div className="ad-top-actions">
          <button className="ad-top-search" type="button" onClick={() => { setFlyout(null); setSearch(true); }} aria-label="Search workspace"><Search size={17}/><span>Search workspace</span></button>
          <div className="ad-flyout-anchor" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFlyout(null); }} onKeyDown={event => {
            if (event.key === "Escape" && flyout === "alerts") { setFlyout(null); alertButton.current?.focus(); }
          }}>
            <button ref={alertButton} className="ad-icon" aria-label="Notifications" aria-expanded={flyout === "alerts"} onClick={() => setFlyout(flyout === "alerts" ? null : "alerts")}><Bell size={19}/>{pending + newQuotes > 0 && <span className="ad-dot"/>}</button>
            {flyout === "alerts" && <div className="ad-flyout"><strong>Demo notifications</strong><Link href="/admin/artwork" onClick={() => setFlyout(null)}>{pending} awaiting artwork review</Link><Link href="/admin/quotations" onClick={() => setFlyout(null)}>{newQuotes} new quotations</Link></div>}
          </div>
          <div className="ad-flyout-anchor" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFlyout(null); }} onKeyDown={event => {
            if (event.key === "Escape" && flyout === "profile") { setFlyout(null); profileButton.current?.focus(); }
          }}>
            <button ref={profileButton} className="ad-profile" aria-label="Admin profile menu" aria-expanded={flyout === "profile"} onClick={() => setFlyout(flyout === "profile" ? null : "profile")}><span>AD</span><ChevronDown size={14}/></button>
            {flyout === "profile" && <div className="ad-flyout"><strong>Demo administrator</strong><Link href="/" onClick={() => setFlyout(null)}>View Storefront</Link><button type="button" onClick={logOut}><LogOut size={15}/> Sign Out</button></div>}
          </div>
        </div>
      </header>
      <main className="ad-content" id="admin-content"><div className="ad-demo-label"><span/> Demo workspace · fictional records</div><div key={resetToken}>{children}</div></main>
    </div>
    {drawer && <Modal title="Admin navigation" drawer close={() => setDrawer(false)}><div className="ad-drawer"><Link href="/admin" className="ad-drawer-brand" onClick={() => setDrawer(false)}><AdminLogo/>AR Printing Operations</Link><SideBar path={path} onNavigate={() => setDrawer(false)}/><Link href="/" onClick={() => setDrawer(false)}>View Storefront</Link></div></Modal>}
    {search && <GlobalSearch close={() => setSearch(false)}/>}
  </div>;
}