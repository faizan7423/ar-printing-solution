"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Gauge } from "lucide-react";
import { PasswordField } from "@/components/account/AuthForm";
import { useAdmin } from "./AdminState";
import { AdminLogo } from "./Logo";
import { approvedAdminReturn } from "./navigation";

export function AdminSignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const { signedIn, signIn } = useAdmin();
  const destination = approvedAdminReturn(params.get("next"));
  function enter() { signIn(); router.replace(destination); }
  return <main className="ad-signin">
    <div className="ad-signin-context"><AdminLogo/><div><p>AR PRINTING SOLUTION</p><h2>Print operations.</h2><span>Orders, artwork and production in one workspace.</span></div></div>
    <div className="ad-signin-content">
      <div className="ad-kicker"><Gauge size={17}/> DEMONSTRATION MODE</div>
      <h1>Admin portal</h1>
      <p>{signedIn ? "Your demo admin session is active." : "Explore a fictional business workspace. Use the demo button to enter without credentials."}</p>
      <button type="button" className="ad-button primary" onClick={enter}>{signedIn ? "Open Dashboard" : "Use Demo Admin Account"}<ArrowRight size={17}/></button>
      {!signedIn && <form autoComplete="off" onSubmit={event => { event.preventDefault(); event.currentTarget.reset(); enter(); }}>
        <label>Email address<input type="email" required maxLength={160}/></label>
        <PasswordField label="Password"/>
        <button className="ad-button secondary" type="submit">Sign In (Demo)</button>
      </form>}
      <p className="ad-muted">This client-side guard demonstrates the interface. Production access requires server-side authentication and authorization.</p>
      <Link className="ad-link" href="/">View Storefront</Link>
    </div>
  </main>;
}