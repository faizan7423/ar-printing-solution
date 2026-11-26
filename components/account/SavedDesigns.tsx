"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/data/catalogue";
import { useCart } from "@/components/shop/CartState";
import { useAccount } from "./AccountState";
import { DesignPreview } from "./DesignPreview";

export function SavedDesigns() {
  const { designs, renameDesign, duplicateDesign, deleteDesign } = useAccount();
  const { save } = useCart();
  const router = useRouter();
  const [renameId, setRenameId] = useState<string>();
  const [message, setMessage] = useState("");

  return <>
    <div className="account-heading"><h2>Saved designs</h2><p>Reopen or duplicate your front and back artwork during this visit.</p><Link className="textlink" href="/customize/t-shirt">Open T-shirt Studio</Link></div>
    <p className="account-feedback" role="status">{message}</p>
    {designs.length ? <div className="account-card-grid">
      {designs.map(design => {
        const product = products.find(product => product.id === design.productId)!;
        return <article className="account-card" key={design.id}>
          <DesignPreview product={product} selection={design.selection} design={design.design}/>
          {renameId === design.id ? <form className="account-rename" onSubmit={event => {
            event.preventDefault();
            const title = event.currentTarget.querySelector("input")?.value.trim();
            if (title) { renameDesign(design.id, title); setRenameId(undefined); setMessage("Design renamed."); }
          }}>
            <label>Design name<input defaultValue={design.title} maxLength={60} required pattern=".*\S.*" autoFocus /></label>
            <button className="button">Save name</button><button type="button" className="textlink" onClick={() => setRenameId(undefined)}>Cancel</button>
          </form> : <h3>{design.title}</h3>}
          <p>{product.name} · {design.selection.colour.name} · {design.selection.size}</p>
          <div className="account-card-actions">
            <Link className="button" href={"/customize/t-shirt?saved=" + design.id}>Edit design</Link>
            <button type="button" className="button outline-button" onClick={() => {
              save({ productId: design.productId, selection: design.selection, design: design.design });
              router.push("/cart");
            }}>Add to Cart</button>
            <button className="textlink" type="button" onClick={() => setRenameId(design.id)}>Rename</button>
            <button className="textlink" type="button" onClick={() => { duplicateDesign(design.id); setMessage("Design duplicated."); }}>Duplicate</button>
            <button className="textlink" type="button" onClick={() => { deleteDesign(design.id); setMessage("Design deleted."); }}>Delete design</button>
          </div>
        </article>;
      })}
    </div> : <div className="account-empty"><h3>No saved designs yet</h3><p>Use Save design in the T-shirt studio to keep a design in this demo account.</p><Link className="button" href="/customize/t-shirt">Start Customizing</Link></div>}
  </>;
}