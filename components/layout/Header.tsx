"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { brand } from "@/data/brand";
import { company } from "@/data/site";
import { shopMenu } from "@/data/catalogue";
import { QuoteButton } from "@/components/forms/QuoteModal";
import { AccountMenu } from "@/components/account/AccountMenu";
import { useCart } from "@/components/shop/CartState";

export function Brand() {
  return <Link className="brand" href="/" aria-label={company.name}>
    <Image className="original-logo" {...brand.logo} alt={company.name} unoptimized />
  </Link>;
}

const links = [["Printing Services", "/services"], ["Bulk Orders", "/#bulk-orders"], ["About Us", "/about"], ["Contact", "/#contact"]];

export function Header() {
  const path = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [mobile, setMobile] = useState(false);
  const [shop, setShop] = useState(false);
  const [search, setSearch] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const shopButton = useRef<HTMLButtonElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);

  function close() { setMobile(false); setShop(false); setSearch(false); }
  function navLink(name: string, href: string) {
    return <Link key={href} href={href} aria-current={path === href ? "page" : undefined} onClick={close}>{name}</Link>;
  }

  return <header className="store-header" onKeyDown={event => {
    if (event.key !== "Escape") return;
    if (search) { setSearch(false); searchButton.current?.focus(); }
    else if (shop) { setShop(false); shopButton.current?.focus(); }
    else if (mobile) { setMobile(false); menuButton.current?.focus(); }
  }}>
    <div className="container bar">
      <Brand />
      <nav id="navigation" aria-label="Main menu" className={mobile ? "shown" : ""}>
        {navLink("Home", "/")}
        <div className="shop-dropdown" onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setShop(false);
        }}>
          <button ref={shopButton} type="button" className="shop-toggle" aria-expanded={shop} aria-controls="shop-menu" onClick={() => setShop(!shop)}>Shop Products <ChevronDown size={15} /></button>
          {shop && <div id="shop-menu" className="shop-menu">{navLink("All products", "/shop")}{shopMenu.map(([name, href]) => navLink(name, href))}</div>}
        </div>
        {links.map(([name, href]) => navLink(name, href))}
        <AccountMenu mobile onNavigate={close} />
        <QuoteButton className="button mobile-quote">Get a Quote</QuoteButton>
      </nav>
      <div className="actions">
        <button ref={searchButton} className="icon-button" type="button" aria-label="Search products" aria-expanded={search} aria-controls="site-search" onClick={() => { setSearch(!search); setMobile(false); setShop(false); }}><Search size={21} /></button>
        <Link className="icon-button cart-link" href="/cart" aria-label={"Cart, " + count + " items"} onClick={close}><ShoppingBag size={21} /><span>{count}</span></Link>
        <AccountMenu onNavigate={close} />
        <QuoteButton className="button headquote">Get a Quote</QuoteButton>
        <button ref={menuButton} type="button" className="menu icon-button" aria-controls="navigation" aria-expanded={mobile} aria-label="Toggle menu" onClick={() => { setMobile(!mobile); setShop(false); setSearch(false); }}>{mobile ? <X /> : <Menu />}</button>
      </div>
    </div>
    {search && <form id="site-search" className="container site-search" role="search" onSubmit={event => {
      event.preventDefault();
      const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
      close();
      router.push(query ? "/shop?q=" + encodeURIComponent(query) : "/shop");
    }}>
      <label>Search the catalogue<input autoFocus name="q" type="search" placeholder="Try polo or tote bag" /></label><button className="button">Search</button>
    </form>}
  </header>;
}