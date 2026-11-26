"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { authLink, returnDestination } from "@/data/account";
import { useAccount } from "./AccountState";

export type AuthMode = "sign-in" | "sign-up" | "forgot-password";
const copy = {
  "sign-in": ["Welcome back.", "Try the customer account with fictional data. Use the demo button to skip the form."],
  "sign-up": ["Create an account.", "Preview registration with sample details. Your entries are cleared when you complete the demo."],
  "forgot-password": ["Reset your password.", "Try the recovery form with a sample email address. The demo sends no email."],
} as const;
export const phonePattern = String.raw`[0-9+\(\) \-]{7,20}`;

export function PasswordField({ label, value, onChange, minLength, describedBy, invalid }: { label: string; value?: string; onChange?: (value: string) => void; minLength?: number; describedBy?: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  const id = useId();
  return <div className="password-field">
    <label htmlFor={id}>{label}</label>
    <div className="password-input">
      <input id={id} type={show ? "text" : "password"} autoComplete="off" aria-describedby={describedBy} aria-invalid={invalid || undefined} required minLength={minLength} maxLength={128}
        value={value} onChange={onChange ? event => onChange(event.target.value) : undefined} />
      <button className="icon-button" type="button" aria-label={(show ? "Hide " : "Show ") + label.toLowerCase()} aria-pressed={show} onClick={() => setShow(!show)}>
        {show ? <EyeOff size={19}/> : <Eye size={19}/>}
      </button>
    </div>
  </div>;
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const next = useSearchParams().get("next");
  const { signIn } = useAccount();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");
  const isSignIn = mode === "sign-in";
  const isSignUp = mode === "sign-up";
  const score = Number(password.length >= 8) + Number(password.length >= 12) + Number(/[0-9]/.test(password)) + Number(/[^a-z0-9]/i.test(password));
  function demoSignIn() { signIn(remember); router.replace(returnDestination(next)); }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSignUp && password !== confirm) {
      setError("The passwords must match.");
      event.currentTarget.querySelector<HTMLInputElement>('[aria-describedby="password-error"]')?.focus();
      return;
    }
    event.currentTarget.reset();
    setPassword("");
    setConfirm("");
    if (isSignIn) demoSignIn(); else setFinished(true);
  }

  return <>
    <small>DEMONSTRATION MODE</small><h1>{finished ? (isSignUp ? "Registration demo complete." : "Recovery demo complete.") : copy[mode][0]}</h1>
    {finished ? <div className="auth-confirmation" role="status"><p>{isSignUp ? "Your entries were cleared. You can explore a fictional account using demo sign-in." : "The sample email was cleared. No password reset email was sent."}</p>
      <Link className="button" href={authLink("/sign-in", next)}>Back to Sign In <ArrowRight size={17}/></Link>
    </div> : <>
      <p>{copy[mode][1]}</p>
      {isSignIn && <button type="button" className="button demo-access" onClick={demoSignIn}>Use demo account <ArrowRight size={17}/></button>}
      <form className="auth-form" autoComplete="off" onSubmit={submit}>
        {isSignUp && <label>Full name<input required pattern=".*\S.*" maxLength={100} /></label>}
        <label>Email address<input type="email" required maxLength={160} /></label>
        {isSignUp && <label>Mobile number<input type="tel" required pattern={phonePattern} maxLength={20} title="Enter a sample phone number with 7 to 20 characters" /></label>}
        {isSignIn && <PasswordField label="Password" />}
        {isSignUp && <>
          <PasswordField label="Password" value={password} onChange={value => { setPassword(value); setError(""); }} minLength={8} describedBy="password-strength"/>
          <label id="password-strength" className="strength-meter">Password strength · {password ? (score >= 3 ? "Strong" : score >= 2 ? "Moderate" : "Weak") : "At least 8 characters"}<meter min={0} max={4} value={score} aria-label="Password strength"/></label>
          <PasswordField label="Confirm password" value={confirm} onChange={value => { setConfirm(value); setError(""); }} minLength={8} describedBy="password-error" invalid={Boolean(error)} />
          <div id="password-error" role="alert" className="form-error">{error}</div>
                    <details className="demo-terms" id="registration-notice"><summary>Demo terms and privacy</summary>
            <p>Use fictional details to try registration. The form clears your entries on completion. This preview creates no account and sends no information.</p>
          </details>
          <label className="check-line"><input type="checkbox" required aria-describedby="registration-notice" /> I acknowledge the demo terms and privacy notice.</label>
        </>}
        {isSignIn && <div className="auth-options"><label className="check-line"><input type="checkbox" aria-describedby="remember-note" checked={remember} onChange={event => setRemember(event.target.checked)} /> Remember me</label><Link href={authLink("/forgot-password", next)}>Forgot password?</Link></div>}
        {isSignIn && <p id="remember-note" className="auth-note">Remember me keeps demo access through refreshes in this tab. Account edits, cart and artwork stay in memory.</p>}
        <button type="submit" className={isSignIn ? "button outline-button" : "button"}>{isSignIn ? "Sign In" : isSignUp ? "Create Account" : "Request Password Reset"}</button>
      </form>
      {isSignIn && <><button className="google-demo" type="button" disabled>Continue with Google <span>Unavailable in demo</span></button><p className="auth-switch">New here? <Link href={authLink("/sign-up", next)}>Create Account</Link></p></>}
      {!isSignIn && <p className="auth-switch"><Link href={authLink("/sign-in", next)}>{isSignUp ? "Already have an account? Sign in" : "Back to Sign In"}</Link></p>}
    </>}
  </>;
}