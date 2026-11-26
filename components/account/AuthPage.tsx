import { Suspense } from "react";
import { Brand } from "@/components/layout/Header";
import { Photo } from "@/components/ui/Editorial";
import { AuthForm, type AuthMode } from "./AuthForm";

export function AuthPage({ mode }: { mode: AuthMode }) {
  return <div className="container auth-shell">
    <div className="auth-editorial">
      <Photo id="tee-custom" alt="Illustrative T-shirt with a coral and blue print" />
      <div className="auth-editorial-copy">
        <Brand />
        <h2>Your ideas, in print.</h2>
        <p>Keep track of your apparel orders and pick up a design whenever inspiration strikes.</p>
      </div>
    </div>
    <div className="auth-content"><Suspense fallback={<p>Loading form…</p>}><AuthForm mode={mode} /></Suspense></div>
  </div>;
}