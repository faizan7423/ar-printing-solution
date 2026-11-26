"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import Link from "next/link";

export function AdminHeading({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <div className="ad-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="ad-actions">{actions}</div>}</div>;
}
export function Panel({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return <section className="ad-panel"><div className="ad-panel-heading"><h2>{title}</h2>{actions}</div>{children}</section>;
}
export function Badge({ label }: { label: string }) {
  const kind = /^(Approved|Paid|Delivered|Active|Visible|Accepted|Completed)$/.test(label) ? "good" :
    /Pending|Awaiting|Low stock|Revision|Partial|New|High/.test(label) ? "warn" :
    /Rejected|Cancelled|Archived|Out of stock|Declined/.test(label) ? "bad" : "neutral";
  return <span className={"ad-badge " + kind}>{label}</span>;
}
export function Empty({ title = "No results", children }: { title?: string; children?: ReactNode }) {
  return <div className="ad-empty"><strong>{title}</strong>{children && <p>{children}</p>}</div>;
}
export function Filter({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label>{label}<select value={value} onChange={event => onChange(event.target.value)}><option value="">All</option>
    {options.map(option => <option key={option}>{option}</option>)}</select></label>;
}
export function Modal({ title, children, close, drawer = false }: { title: string; children: ReactNode; close: () => void; drawer?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className={drawer ? "ad-modal ad-nav-drawer" : "ad-modal"} aria-labelledby={id} onClose={close} onClick={event => {
    if (event.target === dialog.current) close();
  }}>
    <div className="dialog-body"><button className="close" type="button" aria-label="Close dialog" onClick={close}><X size={21}/></button>
      <h2 id={id}>{title}</h2>{children}
    </div>
  </dialog>;
}
export function Confirm({ label, title, detail, onConfirm, className = "ad-button secondary" }: {
  label: string; title: string; detail: string; onConfirm: () => void; className?: string;
}) {
  const [open, setOpen] = useState(false);
  return <><button type="button" className={className} onClick={() => setOpen(true)}>{label}</button>
    {open && <Modal title={title} close={() => setOpen(false)}><p>{detail}</p><div className="ad-actions">
      <button className="ad-button secondary" type="button" autoFocus onClick={() => setOpen(false)}>Keep current data</button>
      <button className="ad-button danger" type="button" onClick={() => { onConfirm(); setOpen(false); }}>Confirm</button>
    </div></Modal>}</>;
}

export function MissingRecord({ type, back }: { type: string; back: string }) {
  return <><AdminHeading title={type + " unavailable"} description="This record may have been reset or created in a different demo session."/><Link className="ad-button secondary" href={back}>Back to list</Link></>;
}

export function LocalImage({ file, fallback, alt = "" }: { file?: File; fallback: string; alt?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (!file || !ref.current) return;
    const node = ref.current;
    const url = URL.createObjectURL(file);
    node.src = url;
    return () => { node.src = fallback; URL.revokeObjectURL(url); };
  }, [file, fallback]);
  // Object URLs are assigned after mount so local files remain in browser memory.
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={fallback} alt={alt}/>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label>{label}{children}</label>;
}