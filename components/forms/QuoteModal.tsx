"use client";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { services } from "@/data/site";

type QuoteDraft = { service: string; notes?: string; quantity?: number };
const OpenQuote = createContext<(draft: QuoteDraft) => void>(() => {});
export function QuoteButton({children="Request a Quote", service="",className="button",notes,quantity}:{children?:ReactNode;service?:string;className?:string;notes?:string;quantity?:number}) {
 const open=useContext(OpenQuote);
 return <button type="button" className={className} onClick={()=>open({service,notes,quantity})}>{children}<ArrowUpRight size={17}/></button>;
}
export function QuoteModal({children}:{children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [draft,setDraft]=useState<QuoteDraft>({service:""});
 const [done,setDone]=useState(false);
 const [open,setOpen]=useState(false);
 function close(){dialog.current?.close()}
 return <OpenQuote.Provider value={next=>{setDraft(next);setDone(false);setOpen(true);dialog.current?.showModal();document.body.style.overflow="hidden"}}>{children}
 <dialog ref={dialog} aria-labelledby="quote-title" onClose={()=>{setOpen(false);document.body.style.overflow=""}} onClick={e=>{if(e.target===dialog.current)close()}}>
 <div className="dialog-body"><button className="close" aria-label="Close quotation form" onClick={close}><X/></button><small>PROJECT ENQUIRY</small><h2 id="quote-title">{done?"Demo complete":"Request a quote"}</h2>
 <p role="status">{done?"Your details have been cleared. No inquiry was sent.":"Demonstration only. Details stay in this form and are never sent or saved."}</p>
 {done?<button className="button" onClick={close}>Close</button>:open&&<form autoComplete="off" onSubmit={e=>{e.preventDefault();setDone(true)}}>
 <label>Full name<input required pattern=".*\S.*" autoFocus maxLength={100}/></label><label>Company name<input maxLength={120}/></label>
 <label>Email<input type="email" required/></label><label>Phone number<input type="tel" pattern="[0-9+\(\) \-]{7,20}" title="Enter a phone number with 7 to 20 characters"/></label>
 <label>Printing service<select value={draft.service} onChange={e=>setDraft({...draft,service:e.target.value})}><option value="">Please advise</option>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
 <label className="wide">Garment sourcing (proposed options)<select><option>Discuss sourcing</option><option>Garment supply and printing</option><option>Print on customer-provided garments</option></select></label><label>Estimated quantity<input type="number" min="1" step="1" defaultValue={draft.quantity}/></label><label className="wide">Additional requirements<textarea rows={3} maxLength={3000} defaultValue={draft.notes}/></label>
 <button className="button wide">Complete demo request <ArrowUpRight size={17}/></button></form>}</div></dialog></OpenQuote.Provider>
}