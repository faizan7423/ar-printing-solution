"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { useId, useRef, useState } from "react";
import { accountLinks, authLink } from "@/data/account";
import { useAccount } from "./AccountState";

export function AccountMenu({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate: () => void }) {
  const { signedIn, signOut } = useAccount();
  const path = usePathname();
  const router = useRouter();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const auth = (route: "/sign-in" | "/sign-up") => authLink(route, path === "/" ? null : path);
  return <div className={mobile ? "customer-menu mobile-customer-menu" : "customer-menu"} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === "Escape" && open) { event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
  }}>
    <button ref={trigger} type="button" className={mobile ? "shop-toggle" : "icon-button"} aria-label="Customer account" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      <UserRound size={21} />{mobile && "Account"}
    </button>
    <div className="customer-menu-links" id={id} hidden={!open}>
      {signedIn ? <>
        {accountLinks.map(([label, href]) => <Link key={href} href={href} onClick={() => { setOpen(false); onNavigate(); }}>{label}</Link>)}
        <button type="button" onClick={() => { signOut(); setOpen(false); onNavigate(); trigger.current?.focus(); if (path.startsWith("/account")) router.replace("/"); }}>Sign Out</button>
      </> : <>
        <Link href={auth("/sign-in")} onClick={() => { setOpen(false); onNavigate(); }}>Sign In</Link>
        <Link href={auth("/sign-up")} onClick={() => { setOpen(false); onNavigate(); }}>Create Account</Link>
      </>}
    </div>
  </div>;
}