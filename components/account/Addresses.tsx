"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import type { Address } from "@/data/account";
import { useAccount } from "./AccountState";

const fields = [["label", "Address label"], ["recipient", "Recipient name"], ["street", "Street address"], ["city", "City"], ["postal", "Postal code"]] as const;

export function Addresses() {
  const { addresses, saveAddress, defaultAddress, deleteAddress } = useAccount();
  const dialog = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<Address>();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  function openAddress(address?: Address) {
    setEditing(address);
    setOpen(true);
    dialog.current?.showModal();
  }

  return <>
    <div className="account-heading"><h2>Saved addresses</h2><p>Use fictional delivery details. Edits stay in memory during this visit.</p></div>
    <button type="button" className="button" onClick={() => openAddress()}>Add Address</button>
    <p className="account-feedback" role="status">{message}</p>
    {addresses.length ? <div className="account-card-grid address-grid">
      {addresses.map(address => <article className="account-card" key={address.id}>
        <h3>{address.label}</h3>{address.primary && <span className="order-state">Default</span>}
        <address>{address.recipient}<br/>{address.street}<br/>{address.city}, {address.postal}</address>
        <div className="account-card-actions">
          <button className="textlink" type="button" onClick={() => openAddress(address)}>Edit Address</button>
          {!address.primary && <button className="textlink" type="button" onClick={() => { defaultAddress(address.id); setMessage("Default address updated."); }}>Set as Default</button>}
          <button className="textlink" type="button" onClick={() => { deleteAddress(address.id); setMessage("Address deleted."); }}>Delete Address</button>
        </div>
      </article>)}
    </div> : <div className="account-empty"><h3>No addresses</h3><p>Add a sample address to try the delivery address controls.</p></div>}
    <dialog ref={dialog} aria-labelledby="address-title" onClose={() => { if (!dialog.current?.open) setOpen(false); }} onClick={event => {
      if (event.target === dialog.current) dialog.current?.close();
    }}>
      <div className="dialog-body"><button type="button" className="close" aria-label="Close address form" onClick={() => dialog.current?.close()}><X/></button>
        <h2 id="address-title">{editing ? "Edit address" : "Add address"}</h2><p>Enter fictional details for this session.</p>
        {open && <form className="address-form" onSubmit={event => {
          event.preventDefault();
          const get = (key: string) => event.currentTarget.querySelector<HTMLInputElement>('[data-field="' + key + '"]')!.value.trim();
          saveAddress({ label: get("label"), recipient: get("recipient"), street: get("street"), city: get("city"), postal: get("postal") }, editing?.id);
          setMessage(editing ? "Address updated." : "Address added.");
          dialog.current?.close();
        }}>
          {fields.map(([key, label]) => <label key={key} className={key === "street" ? "wide" : undefined}>{label}
            <input data-field={key} defaultValue={editing?.[key]} maxLength={key === "postal" ? 20 : 130} autoFocus={key === "label"} required pattern=".*\S.*" autoComplete="off"/>
          </label>)}
          <button className="button wide">Save Address</button>
        </form>}
      </div>
    </dialog>
  </>;
}