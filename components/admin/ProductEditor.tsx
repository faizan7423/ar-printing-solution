"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { printMethods } from "@/data/catalogue";
import { newProduct, productStates, type ProductRecord } from "@/data/admin";
import { readArtwork } from "@/components/shop/design";
import { useAdmin } from "./AdminState";
import { AdminHeading, Field, LocalImage, MissingRecord, Modal, Panel } from "./UI";

export function ProductEditor({ id }: { id?: string }) {
  const { data } = useAdmin();
  const product = id ? data.products.find(item => item.id === id) : undefined;
  if (id && !product) return <MissingRecord type="Product" back="/admin/products"/>;
  return <ProductForm key={id ?? "new"} initial={product ?? { ...newProduct(), categoryId: data.categories.find(category => category.visibility !== "Archived")?.id ?? "" }}/>;
}

const variants = [
  { key: "colours", label: "Colours (comma separated)" }, { key: "sizes", label: "Sizes (comma separated)" },
] as const;
const commercial = [
  { key: "price", label: "Demo base price (₹)", min: 0, step: .01 }, { key: "minimum", label: "Minimum order quantity", min: 1, step: 1 },
  { key: "openingStock", label: "Opening stock per new variant", min: 0, step: 1 }, { key: "threshold", label: "Low-stock threshold per variant", min: 0, step: 1 },
] as const;

function splitChoices(value: string) {
  return Array.from(new Map(value.split(",").map(chunk => chunk.trim()).filter(Boolean).map(item => [item.toLowerCase(), item])).values());
}

function ProductForm({ initial }: { initial: ProductRecord }) {
  const { data, saveProduct } = useAdmin();
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [lists, setLists] = useState({ colours: initial.colours.join(", "), sizes: initial.sizes.join(", ") });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const category = data.categories.find(item => item.id === draft.categoryId);
  const baseImage = "/images/" + draft.image + ".webp";

  function field<K extends keyof ProductRecord>(key: K, value: ProductRecord[K]) { setDraft(current => ({ ...current, [key]: value })); }

  function save(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    const colours = splitChoices(lists.colours);
    const sizes = splitChoices(lists.sizes);
    if (!draft.name.trim() || !draft.description.trim() || !draft.sku.trim() || !category || category.visibility === "Archived") {
      setError("Enter a name, description, SKU and active category."); return;
    }
    if (data.products.some(product => product.id !== draft.id && product.sku.toLowerCase() === draft.sku.trim().toLowerCase())) {
      setError("That SKU is already used by another demo product."); return;
    }
    if (!colours.length || !sizes.length || colours.length * sizes.length > 150 || [...colours, ...sizes].some(item => item.length > 32 || item.includes("|"))) {
      setError("Enter valid colours and sizes for up to 150 variants. Each option can use up to 32 characters."); return;
    }
    const id = saveProduct({ ...draft, name: draft.name.trim(), sku: draft.sku.trim(), description: draft.description.trim(), colours, sizes });
    field("id", id);
    setError("");
    setMessage("Draft product saved. Inventory variants are up to date.");
    if (!initial.id) router.replace("/admin/products/" + id + "/edit");
  }

  async function chooseFiles(files: File[]) {
    setError("");
    if (files.length > 5) { setError("Choose up to five PNG, JPEG or WebP images."); return; }
    setLoading(true);
    try {
      await Promise.all(files.map(readArtwork));
      setDraft(current => ({ ...current, files }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The image could not be opened.");
    } finally { setLoading(false); }
  }

  return <><AdminHeading title={initial.id ? "Edit product" : "New product"} description={initial.id ? draft.name : "Create a new entry in the demo catalogue."}
    actions={<Link className="ad-button secondary" href="/admin/products">All products</Link>}/>
    <form className="ad-product-editor" autoComplete="off" onSubmit={save}>
      <div className="ad-grid-two">
        <Panel title="Product information"><div className="ad-form-grid">
          <Field label="Product name"><input value={draft.name} onChange={event => field("name", event.target.value)} required maxLength={100}/></Field>
          <Field label="Description"><textarea value={draft.description} onChange={event => field("description", event.target.value)} rows={3} maxLength={800} required/></Field>
          <Field label="Category"><select required value={draft.categoryId} onChange={event => field("categoryId", event.target.value)}>
            <option value="" disabled>Select category</option>
            {data.categories.filter(item => item.visibility !== "Archived").map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></Field>
          <Field label="SKU"><input required maxLength={45} pattern="[A-Za-z0-9._\-]+" value={draft.sku} onChange={event => field("sku", event.target.value)}/></Field>
          <Field label="Fabric information"><input value={draft.fabric} onChange={event => field("fabric", event.target.value)} maxLength={160}/></Field>
          <Field label="Demo catalogue visibility"><select value={draft.status} onChange={event => field("status", event.target.value as ProductRecord["status"])}>{productStates.map(item => <option key={item}>{item}</option>)}</select></Field>
        </div></Panel>
        <Panel title="Product images">
          <label>Choose local images<input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={loading} onChange={event => {
            const files = Array.from(event.target.files ?? []); event.target.value = ""; if (files.length) void chooseFiles(files);
          }}/></label>
          <p className="ad-muted ad-spaced">Up to five local files, 10 MB each. Images stay in this tab.</p>
          <div className="ad-image-grid">{(draft.files.length ? draft.files : [undefined]).map((file, index) => <div key={index}>
            <LocalImage file={file} fallback={baseImage} alt={file?.name ?? "Illustrative product photograph"}/>
            {file && <button type="button" className="ad-button secondary" onClick={() => field("files", draft.files.filter((_, i) => i !== index))}>Remove image {index + 1}</button>}
          </div>)}</div>
        </Panel>
        <Panel title="Variants & printing"><div className="ad-form-grid">
          {variants.map(({ key, label }) => <Field key={key} label={label}><input required maxLength={260} value={lists[key]} onChange={event => setLists({ ...lists, [key]: event.target.value })}/></Field>)}
          <fieldset><legend>Printing methods</legend>{printMethods.slice(1).map(method => <label className="ad-inline-check" key={method}><input type="checkbox" checked={draft.methods.includes(method)}
            onChange={event => field("methods", event.target.checked ? [...draft.methods, method] : draft.methods.filter(item => item !== method))}/>{method}</label>)}</fieldset>
          <fieldset><legend>Print placements</legend>{["Front", "Back", "Other"].map(placement => <label className="ad-inline-check" key={placement}><input type="checkbox" checked={draft.placements.includes(placement)}
            onChange={event => field("placements", event.target.checked ? [...draft.placements, placement] : draft.placements.filter(item => item !== placement))}/>{placement}</label>)}</fieldset>
        </div></Panel>
        <Panel title="Pricing & stock setup"><div className="ad-form-grid">
          {commercial.map(({ key, label, min, step }) => <Field key={key} label={label}><input type="number" min={min} max={999999} step={step} required
            value={draft[key]} onChange={event => field(key, Number(event.target.value))}/></Field>)}
          <p>Existing variants retain their stock counts when product details change.</p>
        </div></Panel>
      </div>
      <Panel title="SEO draft"><div className="ad-form-grid">
        <Field label="SEO title"><input value={draft.seoTitle} onChange={event => field("seoTitle", event.target.value)} maxLength={90}/></Field>
        <Field label="SEO description"><textarea value={draft.seoDescription} onChange={event => field("seoDescription", event.target.value)} maxLength={200} rows={2}/></Field>
      </div></Panel>
      <div className="ad-actions"><button className="ad-button primary" disabled={loading}>Save Product</button>
        <button className="ad-button secondary" type="button" onClick={() => setPreview(true)}>Preview draft</button></div>
      {error && <p className="form-error" role="alert">{error}</p>}<p role="status">{message}</p>
    </form>
    {preview && <Modal title="Storefront-style product preview" close={() => setPreview(false)}>
      <div className="ad-draft-preview"><LocalImage file={draft.files[0]} fallback={baseImage} alt="Draft product illustration"/><h3>{draft.name || "Untitled product"}</h3>
        <p>{draft.description}</p><p>{category?.name} · {lists.colours}</p><strong>Price on Request</strong><p>Draft preview for internal review.</p></div>
    </Modal>}
  </>;
}