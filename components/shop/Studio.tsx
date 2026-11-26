"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import { ArrowUpRight, Eye, RotateCcw, Trash2, Upload } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { defaultProduct, placements, printMethods, products, sizes, type Product } from "@/data/catalogue";
import { useCart, type Artwork, type CartItem, type Selection, type Side } from "./CartState";
import { ColourField, defaultSelection, PrintFields, Quantity, SizeField } from "./SelectionFields";
import { ProductMockup, printBounds } from "./ProductMockup";
import { ArtworkLayer } from "./ArtworkLayer";
import { blankDesign, constrain, designPlacement, fonts, readArtwork, sides } from "./design";
import { Price } from "./ShopShared";
import { authLink } from "@/data/account";
import { useAccount } from "@/components/account/AccountState";

export function Studio() {
  const params = useSearchParams();
  const { items } = useCart();
  const { designs, studioDraft } = useAccount();
  const saved = designs.find(item => item.id === params.get("saved"));
  const draft = params.get("resume") === "design" ? studioDraft : undefined;
  const editing = items.find(item => item.id === (draft?.cartId ?? params.get("edit")) && products.some(product => product.id === item.productId && product.category === "t-shirts"));
  const product = products.find(item => item.category === "t-shirts" && item.id === (draft?.productId ?? saved?.productId ?? editing?.productId ?? params.get("product"))) ?? defaultProduct;
  const fallback = draft?.selection ?? saved?.selection ?? editing?.selection ?? defaultSelection(product);
  const quantity = Number(params.get("quantity"));
  const initial: Selection = {
    colour: product.colourChoices.find(colour => colour.name === params.get("colour")) ?? fallback.colour,
    size: sizes.find(size => size === params.get("size")) ?? fallback.size,
    quantity: Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 9999 ? quantity : fallback.quantity,
    placement: placements.find(item => item === params.get("placement")) ?? fallback.placement,
    method: printMethods.find(method => method === params.get("method")) ?? fallback.method,
  };
  return <Editor key={params.toString()} product={product} editing={editing} initial={initial} initialDesign={draft?.design ?? saved?.design ?? editing?.design} savedId={saved?.id} />;
}

function Editor({ product, editing, initial, initialDesign, savedId }: { product: Product; editing?: CartItem; initial: Selection; initialDesign?: CartItem["design"]; savedId?: string }) {
  const router = useRouter();
  const { save } = useCart();
  const { signedIn, saveDesign: saveToAccount, setStudioDraft } = useAccount();
  const [accountDesignId, setAccountDesignId] = useState(savedId);
  const [savedMessage, setSavedMessage] = useState("");
  const [selection, setSelection] = useState(initial);
  const [design, setDesign] = useState(initialDesign ?? blankDesign);
  const [side, setSide] = useState<Side>(initial.placement === "Back" ? "back" : "front");
  const [selectedId, setSelectedId] = useState(design[side][0]?.id ?? "");
  const [preview, setPreview] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; start: DOMPoint; layer: Artwork } | null>(null);
  const selected = design[side].find(layer => layer.id === selectedId);
  const placement = designPlacement(design, selection.placement);

  function add(layer: Artwork, target = side) {
    setDesign(current => ({ ...current, [target]: [...current[target], constrain(layer)] }));
    setSelectedId(layer.id);
  }
  function update(layer: Artwork) {
    setDesign(current => ({ ...current, [side]: current[side].map(item => item.id === layer.id ? constrain(layer) : item) }));
  }
  function remove() {
    setDesign(current => ({ ...current, [side]: current[side].filter(item => item.id !== selectedId) }));
    setSelectedId("");
  }
  function position() { return { id: crypto.randomUUID(), x: 200, y: 208, width: 94, angle: 0 }; }
  async function upload(file: File) {
    setError(""); setLoading(true);
    try {
      const ratio = await readArtwork(file);
      add({ ...position(), kind: "image", file, ratio });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The image could not be opened.");
    } finally { setLoading(false); }
  }
  function localPoint(event: PointerEvent) {
    const matrix = svg.current?.getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null;
  }
  function startDrag(event: PointerEvent<SVGGElement>, layer: Artwork) {
    if (event.button !== 0) return;
    const point = localPoint(event);
    if (!point) return;
    event.preventDefault();
    setSelectedId(layer.id);
    drag.current = { id: layer.id, start: point, layer };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event: PointerEvent) {
    const active = drag.current;
    const point = localPoint(event);
    if (active && point) update({ ...active.layer, x: active.layer.x + point.x - active.start.x, y: active.layer.y + point.y - active.start.y });
  }
  function saveDesign() {
    save({ productId: product.id, selection: { ...selection, placement }, design }, editing?.id);
    router.push("/cart");
  }

  return <div className="studio-grid">
    <section className="studio-panel studio-tools" aria-labelledby="tools-heading">
      <h2 id="tools-heading">Design tools</h2>
      <ColourField product={product} value={selection.colour} onChange={colour => setSelection({ ...selection, colour })} />
      <details open><summary>Add text or artwork</summary>
        <form className="studio-text-form" onSubmit={event => {
          event.preventDefault();
          if (!text.trim()) return;
          add({ ...position(), kind: "text", text: text.trim(), font: "Sans serif", ink: "#111c25" });
          setText("");
        }}>
          <label>Custom text<input value={text} onChange={event => setText(event.target.value)} maxLength={80} required /></label>
          <button type="submit" className="button outline-button">Add text</button>
        </form>
        <label className="upload-label"><span><Upload size={17} /> Choose artwork</span><input type="file" accept="image/png,image/jpeg,image/webp" disabled={loading}
          onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file); }} /></label>
        <p className="caption">PNG, JPEG or WebP · up to 10 MB</p>
        {loading && <p role="status">Opening image…</p>}{error && <p className="form-error" role="alert">{error}</p>}
      </details>
      <details open><summary>Edit {side} layers</summary>
        <div className="layer-list">{design[side].length ? design[side].map((layer, index) => <button type="button" key={layer.id} aria-pressed={layer.id === selectedId}
          onClick={() => { setPreview(false); setSelectedId(layer.id); }}>{index + 1}. {layer.kind === "text" ? layer.text : layer.file.name}</button>) : <p className="caption">Add text or artwork to this side.</p>}</div>
        {selected && <div className="layer-options">
          {selected.kind === "text" && <>
            <label>Text<input value={selected.text} maxLength={80} onChange={event => update({ ...selected, text: event.target.value })} /></label>
            <label>Text font<select value={selected.font} onChange={event => update({ ...selected, font: event.target.value })}>{Object.keys(fonts).map(font => <option key={font}>{font}</option>)}</select></label>
            <label>Text colour<input type="color" value={selected.ink} onChange={event => update({ ...selected, ink: event.target.value })} /></label>
          </>}
          <label>{selected.kind === "text" ? "Text size" : "Artwork size"}<input type="range" min={4} max={146} step="any" value={selected.width} onChange={event => update({ ...selected, width: Number(event.target.value) })} /></label>
          <label>Rotation <span>{selected.angle}°</span><input type="range" min={-180} max={180} value={selected.angle} onChange={event => update({ ...selected, angle: Number(event.target.value) })} /></label>
          <div className="nudge" aria-label="Move selected layer">
            {[["Left", -4, 0], ["Right", 4, 0], ["Up", 0, -4], ["Down", 0, 4]].map(([label, dx, dy]) =>
              <button type="button" key={label} onClick={() => update({ ...selected, x: selected.x + Number(dx), y: selected.y + Number(dy) })}>{label}</button>)}
          </div>
          <button type="button" className="textlink" onClick={remove}><Trash2 size={16} /> Remove layer</button>
        </div>}
      </details>
      {resetConfirm
        ? <div className="reset-options"><p>Clear all text and artwork from both sides?</p><button className="button outline-button" onClick={() => { setDesign(blankDesign()); setSelectedId(""); setResetConfirm(false); }}>Clear design</button><button className="textlink" onClick={() => setResetConfirm(false)}>Cancel</button></div>
        : <button className="textlink" type="button" onClick={() => setResetConfirm(true)}><RotateCcw size={16} /> Reset design</button>}
    </section>

    <section className="studio-preview" aria-label="T-shirt preview">
      <div className="studio-mode">
        <div className="segmented" aria-label="Print side">{sides.map(value => <button type="button" key={value} aria-pressed={side === value} onClick={() => { setSide(value); setSelectedId(""); }}>{value === "front" ? "Front" : "Back"}</button>)}</div>
        <button type="button" className="icon-button" aria-pressed={preview} onClick={() => setPreview(!preview)}><Eye size={18} /> {preview ? "Edit design" : "Preview"}</button>
      </div>
      <div className="studio-board" onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
        <ProductMockup product={product} colour={selection.colour.hex} side={side} svgRef={svg}>
          {!preview && <rect {...{ x: printBounds.left, y: printBounds.top, width: printBounds.width, height: printBounds.height }}
            fill="white" fillOpacity=".05" stroke="#00a4aa" strokeWidth="2" strokeDasharray="5 5" pointerEvents="none" />}
          {design[side].map(layer => <ArtworkLayer key={layer.id} layer={layer} selected={!preview && selectedId === layer.id}
            onPointerDown={preview ? undefined : event => startDrag(event, layer)} />)}
        </ProductMockup>
      </div>
      <p className="caption">{preview ? "Illustrative preview. Final print appearance requires production approval." : "Drag a layer within the outline, or use the movement buttons in the layer controls."}</p>
    </section>

    <section className="studio-panel studio-summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Your T-shirt</h2><p>{product.name}</p>
      <SizeField value={selection.size} onChange={size => setSelection({ ...selection, size })} />
      <div className="option-label">Quantity</div><Quantity value={selection.quantity} onChange={quantity => setSelection({ ...selection, quantity })} />
      <PrintFields value={selection} onChange={setSelection} showPlacement={false} />
      <dl className="design-summary"><div><dt>Colour</dt><dd>{selection.colour.name}</dd></div><div><dt>Print placement</dt><dd>{placement}</dd></div><div><dt>Artwork</dt><dd>{design.front.length} front · {design.back.length} back</dd></div></dl>
      <p className="caption">Artwork stays in memory for this visit.</p>
            <div className="studio-account-actions">
        {signedIn ? <button type="button" className="button outline-button" disabled={loading} onClick={() => {
          const id = saveToAccount({ productId: product.id, selection: { ...selection, placement }, design }, accountDesignId);
          if (id) { setAccountDesignId(id); setSavedMessage("Design saved for this visit."); }
        }}>{accountDesignId ? "Update saved design" : "Save design"}</button> :
          <Link className="textlink" href={authLink("/sign-in", "/customize/t-shirt?resume=design")} onClick={() => {
            setStudioDraft({ productId: product.id, selection: { ...selection, placement }, design, cartId: editing?.id });
          }}>Sign in to save design</Link>}
        {accountDesignId && <Link className="textlink" href="/account/designs">View saved designs</Link>}
        <p className="account-feedback" role="status">{savedMessage}</p>
      </div>
      <div className="studio-buy"><Price /><button className="button" type="button" disabled={loading} onClick={saveDesign}>{editing ? "Save cart changes" : "Add to Demo Cart"} <ArrowUpRight size={18} /></button></div>
    </section>
  </div>;
}