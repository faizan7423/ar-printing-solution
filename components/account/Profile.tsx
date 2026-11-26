"use client";

import { useState } from "react";
import { PasswordField, phonePattern } from "./AuthForm";
import { useAccount } from "./AccountState";

export function Profile() {
  const { profile, setProfile, preferences, setPreferences } = useAccount();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  return <>
    <div className="account-heading"><h2>Profile settings</h2><p>Manage fictional account details and try the preference controls.</p></div>
    <div className="profile-grid">
      <section className="account-card"><h3>Contact details</h3>
        {editing ? <form className="profile-form" autoComplete="off" onSubmit={event => {
          event.preventDefault();
          const [name, email, mobile] = Array.from(event.currentTarget.querySelectorAll("input"), input => input.value.trim());
          setProfile({ name, email, mobile });
          setMessage("Demo profile updated for this visit.");
          setEditing(false);
        }}>
          <label>Display name<input required pattern=".*\S.*" maxLength={100} defaultValue={profile.name}/></label>
          <label>Email<input required type="email" maxLength={160} defaultValue={profile.email}/></label>
          <label>Mobile number<input required type="tel" maxLength={20} pattern={phonePattern} defaultValue={profile.mobile}/></label>
          <div className="account-card-actions"><button className="button">Save Profile</button><button type="button" className="textlink" onClick={() => setEditing(false)}>Cancel</button></div>
        </form> : <>
          <dl className="account-facts">
            <div><dt>Display name</dt><dd>{profile.name}</dd></div><div><dt>Email</dt><dd>{profile.email}</dd></div><div><dt>Mobile number</dt><dd>{profile.mobile}</dd></div>
          </dl>
          <button className="button outline-button" type="button" onClick={() => setEditing(true)}>Edit Profile</button>
        </>}
        <p className="account-feedback" role="status">{message}</p>
      </section>
      <section className="account-card"><h3>Communication preferences</h3>
        <p>Preview your settings for a future account.</p>
        <div className="profile-preferences">
          <label className="check-line"><input type="checkbox" checked={preferences.orders} onChange={event => setPreferences({ ...preferences, orders: event.target.checked })}/> Order updates</label>
          <label className="check-line"><input type="checkbox" checked={preferences.news} onChange={event => setPreferences({ ...preferences, news: event.target.checked })}/> Product news</label>
        </div>
      </section>
      <section className="account-card"><h3>Change password</h3><p>Use sample values to try the form.</p>
        <form className="profile-form" autoComplete="off" onSubmit={event => {
          event.preventDefault();
          const [, password, confirmation] = Array.from(event.currentTarget.querySelectorAll("input"), input => input.value);
          setPasswordMessage("");
          if (password !== confirmation) {
            setPasswordError("The new passwords must match.");
            event.currentTarget.querySelector<HTMLInputElement>('[aria-describedby="change-password-error"]')?.focus();
            return;
          }
          event.currentTarget.reset();
          setPasswordError("");
          setPasswordMessage("Password change demo complete. The form was cleared.");
        }}>
          <PasswordField label="Sample current password"/>
          <PasswordField label="New password" minLength={8}/>
          <PasswordField label="Confirm new password" minLength={8} describedBy="change-password-error" invalid={Boolean(passwordError)}/>
          <p className="form-error" id="change-password-error" role="alert">{passwordError}</p>
          <button className="button">Try Password Change</button>
        </form>
        <p className="account-feedback" role="status">{passwordMessage}</p>
      </section>
    </div>
  </>;
}