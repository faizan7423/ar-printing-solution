"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, CircleHelp, LogOut } from "lucide-react";
import { accountLinks, authLink } from "@/data/account";
import { useAccount } from "./AccountState";

export function AccountShell({ children }: { children: React.ReactNode }) {
  const { signedIn, signOut } = useAccount();
  const pathname = usePathname();
  const router = useRouter();

  if (!signedIn) return <div className="container shop-body account-gate">
    <small>DEMONSTRATION MODE</small><h1>Your customer account.</h1>
    <p>Sign in with the fictional demo account to explore orders, designs and account settings.</p>
    <Link className="button" href={authLink("/sign-in", pathname)}>Go to Sign In <ArrowRight size={17}/></Link>
  </div>;

  return <div className="container account-wrap">
    <div className="account-banner"><small>FICTIONAL DEMONSTRATION ACCOUNT</small><h1>Customer account.</h1></div>
    <div className="account-layout">
      <aside className="account-sidebar">
        <nav aria-label="Customer account">
          {accountLinks.map(([label, href]) => <Link key={href} href={href}
            aria-current={pathname === href || (href !== "/account" && pathname.startsWith(href + "/")) ? "page" : undefined}>{label}</Link>)}
          <Link href="/#contact"><CircleHelp size={16}/> Help and Support</Link>
          <button type="button" onClick={() => { signOut(); router.replace("/"); }}><LogOut size={16}/> Sign Out</button>
        </nav>
      </aside>
      <div className="account-content">{children}</div>
    </div>
  </div>;
}