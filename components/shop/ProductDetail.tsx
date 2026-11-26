"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Expand, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Product } from "@/data/catalogue";
import { QuoteButton } from "@/components/forms/QuoteModal";
import { Photo } from "@/components/ui/Editorial";
import { useCart } from "./CartState";
import { ColourField, defaultSelection, PrintFields, Quantity, SizeField } from "./SelectionFields";
import { ProductMockup } from "./ProductMockup";
import { WishlistButton } from "@/components/account/WishlistButton";
import { Price } from "./ShopShared";

export function ProductDetail({ product, editId }: { product: Product; editId?: string }) {
  const router = useRouter();
  const { items, save } = useCart();
  const editing = items.find(item => item.id === editId && item.productId === product.id);
  const [selection, setSelection] = useState(editing?.selection ?? defaultSelection(product));
  const [view, setView] = useState<"photo" | "front" | "back">("photo");
  const zoom = useRef<HTMLDialogElement>(null);
  const isShirt = product.category === "t-shirts";

  function add() {
    save({ productId: product.id, selection, design: editing?.design }, editing?.id);
    router.push("/cart");
  }

  const renderView = () => view === "photo"
    ? <Photo id={product.image} alt="Representative catalogue photography" />
    : <ProductMockup product={product} colour={selection.colour.hex} side={view} />;

  return <div className="product-detail">
    <div>
      <div className="product-stage">
        {renderView()}
        <WishlistButton productId={product.id} productName={product.name}/>
        <button className="icon-button zoom-button" onClick={() => zoom.current?.showModal()} aria-label="Expand product preview"><Expand size={20}/></button>
      </div>
      <div className="thumbnail-row" aria-label="Product views">{(["photo", "front", "back"] as const).map(item =>
        <button type="button" key={item} aria-pressed={view === item} onClick={() => setView(item)}>
          <span className="product-thumb" aria-hidden="true">{item === "photo" ? <Photo id={product.image} alt="" /> : <ProductMockup product={product} colour={selection.colour.hex} side={item} />}</span>
          {item === "photo" ? "Photo" : item === "front" ? "Front" : "Back"}
        </button>
      )}</div>
      <p className="caption">Representative photography and illustrative colour previews.</p>
      <dialog ref={zoom} className="zoom-dialog" aria-labelledby="zoom-title" onClick={event => { if (event.target === zoom.current) zoom.current?.close(); }}>
        <div className="dialog-body"><h2 id="zoom-title">{product.name}</h2><button type="button" className="close" aria-label="Close expanded view" onClick={() => zoom.current?.close()}><X /></button><div className="product-stage">{renderView()}</div></div>
      </dialog>
    </div>
    <div className="product-config">
      <small>DEMONSTRATION CATALOGUE</small>
      <h1>{product.name}</h1><p>{product.description}</p><Price />
      <ColourField product={product} value={selection.colour} onChange={colour => { setSelection({ ...selection, colour }); if (view === "photo") setView("front"); }} />
      {isShirt && <SizeField value={selection.size} onChange={size => setSelection({ ...selection, size })} />}
      <div className="option-label">Quantity</div><Quantity value={selection.quantity} onChange={quantity => setSelection({ ...selection, quantity })} />
      <PrintFields value={selection} onChange={setSelection} />
      <div className="product-actions">
        {isShirt && <Link className="button" href={"/customize/t-shirt?" + new URLSearchParams({
          product: product.id, colour: selection.colour.name, size: selection.size, quantity: String(selection.quantity), placement: selection.placement, method: selection.method,
          ...(editing ? { edit: editing.id } : {}),
        }).toString()}>Customize Design <ArrowUpRight size={17} /></Link>}
        <button className={isShirt ? "button outline-button" : "button"} onClick={add}>{editing ? "Save changes" : "Add to Cart"}</button>
        <QuoteButton className="textlink">Request Bulk Quote</QuoteButton>
      </div>
    </div>
  </div>;
}