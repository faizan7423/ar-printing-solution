"use client";

import { useState } from "react";
import { company, services } from "@/data/site";
import { featured } from "@/data/catalogue";
import { readArtwork } from "@/components/shop/design";
import { useAdmin } from "./AdminState";
import { AdminHeading, LocalImage, Panel } from "./UI";

const serviceFields = services.map(service => ({ key: service.id, label: service.name, value: service.desc, long: true }));
const tabs = [
  { id: "hero", title: "Homepage hero", fields: [{ key: "heading", label: "Hero headline", value: "Precision printing. Distinctive apparel." }, { key: "copy", label: "Intro copy", value: "Garment printing, heat-transfer and textile decoration.", long: true }, { key: "cta", label: "Primary CTA label", value: "Shop Custom Apparel" }] },
  { id: "banners", title: "Promotional banners", fields: [{ key: "heading", label: "Banner headline", value: "Start with your artwork" }, { key: "copy", label: "Banner copy", value: "", long: true }] },
  { id: "featured", title: "Featured products", fields: [{ key: "heading", label: "Section heading", value: "Featured products" }] },
  { id: "services", title: "Printing services", fields: [{ key: "heading", label: "Section heading", value: "Printing services" }, ...serviceFields] },
  { id: "gallery", title: "Gallery images", fields: [{ key: "heading", label: "Gallery heading", value: "Printing gallery" }, { key: "caption", label: "Gallery caption", value: "Illustrative prints and finishes." }] },
  { id: "faq", title: "Frequently asked questions", fields: [{ key: "question", label: "Question", value: "" }, { key: "answer", label: "Answer", value: "", long: true }] },
  { id: "contact", title: "Company contact", fields: [{ key: "email", label: "Email draft", value: company.email }, { key: "phone", label: "Phone draft", value: company.phones[0][0] }, { key: "address", label: "Address draft", value: company.address, long: true }] },
  { id: "footer", title: "Website footer", fields: [{ key: "heading", label: "Footer title", value: company.name }, { key: "copy", label: "Footer copy", value: "Garment and textile printing in Bengaluru, Karnataka, India.", long: true }] },
];
type Section = typeof tabs[number];

export function Content() {
  const [section, setSection] = useState(tabs[0]);
  return <><AdminHeading title="Content management" description="Draft and preview proposed storefront changes. The company logo and public content are protected."/>
    <nav className="ad-switcher" aria-label="Content sections">{tabs.map(tab => <button className="ad-button secondary" aria-pressed={section.id === tab.id} type="button" key={tab.id} onClick={() => setSection(tab)}>{tab.title}</button>)}</nav>
    <ContentEditor key={section.id} section={section}/>
  </>;
}

function ContentEditor({ section }: { section: Section }) {
  const { data, update } = useAdmin();
  const [fields, setFields] = useState(() => Object.fromEntries(section.fields.map(field => [field.key, data.content[section.id + "." + field.key] ?? field.value])));
  const [featuredIds, setFeatured] = useState(() => data.content["featured.products"]?.split(",").filter(Boolean) ?? featured.map(item => item.id));
  const [files, setFiles] = useState(data.galleryFiles);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function choose(images: File[]) {
    setError("");
    if (images.length > 5) { setError("Choose up to five local images."); return; }
    setBusy(true);
    try { await Promise.all(images.map(readArtwork)); setFiles(images); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to open those images."); }
    finally { setBusy(false); }
  }
  return <div className="ad-grid-two">
    <Panel title={section.title + " draft"}>
      <form className="ad-form" onSubmit={event => {
        event.preventDefault();
        const content = Object.fromEntries(Object.entries(fields).map(([key, value]) => [section.id + "." + key, value]));
        if (section.id === "featured") content["featured.products"] = featuredIds.join(",");
        update(current => ({ ...current, content: { ...current.content, ...content }, galleryFiles: section.id === "gallery" ? files : current.galleryFiles }));
        setMessage("Draft saved for this demo session.");
      }}>
        {section.fields.map(({ key, label, long }) => <label className="wide" key={key}>{label}
          {long ? <textarea rows={3} maxLength={600} value={fields[key]} onChange={event => setFields({ ...fields, [key]: event.target.value })}/> :
            <input maxLength={180} value={fields[key]} onChange={event => setFields({ ...fields, [key]: event.target.value })}/>}
        </label>)}
        {section.id === "featured" && <fieldset className="wide"><legend>Featured products</legend>{data.products.filter(product => product.status !== "Archived").map(product => <label key={product.id} className="ad-inline-check">
          <input type="checkbox" checked={featuredIds.includes(product.id)} onChange={event => setFeatured(event.target.checked ? [...featuredIds, product.id] : featuredIds.filter(id => id !== product.id))}/>{product.name}
        </label>)}</fieldset>}
        {section.id === "gallery" && <><label className="wide">Local gallery images<input type="file" multiple accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => {
          const list = Array.from(event.target.files ?? []); event.target.value = ""; if (list.length) void choose(list);
        }}/></label>{files.length > 0 && <button className="ad-button secondary" type="button" onClick={() => setFiles([])}>Clear local images</button>}</>}
        <button className="ad-button primary" disabled={busy}>Save draft</button><p className="wide" role="status">{message}</p>{error && <p className="wide form-error" role="alert">{error}</p>}
      </form>
    </Panel>
    <Panel title="Draft preview"><div className="ad-content-preview">
      {section.id === "hero" && <div className="ad-hero-preview"><h3>{fields.heading}</h3><p>{fields.copy}</p><span className="ad-button primary">{fields.cta}</span></div>}
      {section.id === "featured" && <><h3>{fields.heading}</h3><div className="ad-image-grid">{data.products.filter(product => featuredIds.includes(product.id)).map(product => <div key={product.id}><LocalImage file={product.files[0]} fallback={"/images/" + product.image + ".webp"}/><strong>{product.name}</strong></div>)}</div></>}
      {section.id === "gallery" && <><h3>{fields.heading}</h3><p>{fields.caption}</p><div className="ad-image-grid">{(files.length ? files : [undefined, undefined]).map((file, index) => <LocalImage key={index} file={file} fallback={index % 2 ? "/images/glitter.webp" : "/images/screen.webp"} alt="Gallery preview"/>)}</div></>}
      {section.id === "services" && <><h3>{fields.heading}</h3>{services.map(service => <details key={service.id}><summary>{service.name}</summary><p>{fields[service.id]}</p></details>)}</>}
      {section.id === "faq" && <details open><summary>{fields.question || "Your draft question"}</summary><p>{fields.answer}</p></details>}
      {section.id === "contact" && <address>{fields.email}<br/>{fields.phone}<br/>{fields.address}</address>}
      {(section.id === "banners" || section.id === "footer") && <><h3>{fields.heading}</h3><p>{fields.copy}</p></>}
    </div><p className="ad-muted ad-spaced">Internal preview · public changes require a separate publishing workflow.</p></Panel>
  </div>;
}