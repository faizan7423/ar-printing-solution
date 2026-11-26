"use client";

import { ArtworkLayer } from "@/components/shop/ArtworkLayer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "@/components/account/AccountState";
import { artworkStages, formatDate, type AdminData, type ArtworkRecord, type ArtStage } from "@/data/admin";
import { allowedArtworkStages, useAdmin, note } from "./AdminState";
import { AdminHeading, Badge, Confirm, Empty, Field, Filter, MissingRecord, Panel } from "./UI";
import { ProofPreview } from "./ProofPreview";
import { Notes } from "./Orders";

function artworkCustomer(data: AdminData, art: ArtworkRecord) {
  const order = data.orders.find(order => order.id === art.orderId);
  return data.customers.find(customer => customer.id === order?.customerId)?.name ?? art.customerLabel ?? "Demo studio";
}

export function ArtworkQueue() {
  const { data, update } = useAdmin();
  const { designs } = useAccount();
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const list = data.artwork.filter(art => (!status || art.status === status) &&
    [art.id, art.orderId, artworkCustomer(data, art)].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const imports = designs.filter(design => !data.artwork.some(art => art.id === "studio-" + design.id));
  return <><AdminHeading title="Artwork approvals" description="Inspect garment proofs and record proposed review decisions."/>
    {imports.length > 0 && <Panel title="Saved studio designs in this tab"><ul className="ad-dashboard-list">{imports.map(design => <li key={design.id}><span>{design.title}</span><button type="button" className="ad-button secondary" onClick={() => update(current => {
      const id = "studio-" + design.id;
      if (current.artwork.some(art => art.id === id)) return current;
      return { ...current, artwork: [{
        id, productId: design.productId, customerLabel: "Demo studio", date: new Date().toISOString(), status: "Pending Review", priority: "Normal",
        placement: design.selection.placement, method: design.selection.method, colour: design.selection.colour.name, design: design.design, notes: [],
      }, ...current.artwork] };
    })}>Add to review queue</button></li>)}</ul></Panel>}
    <Panel title="Review queue">
      <div className="ad-filters"><Field label="Find artwork"><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Reference or customer"/></Field>
        <Filter label="Review status" value={status} onChange={setStatus} options={artworkStages}/></div>
      {list.length ? <div className="ad-table-wrap" tabIndex={0} role="region" aria-label="Artwork review queue"><table><thead><tr>
        <th>Artwork</th><th>Order</th><th>Customer</th><th>Product</th><th>Placement</th><th>Submitted</th><th>Status</th><th>Priority</th><th>Action</th>
      </tr></thead><tbody>{list.map(art => <tr key={art.id}>
        <th scope="row"><div className="ad-record-label"><svg className="ad-proof-mini" aria-hidden="true" viewBox="124 139 152 113">{(art.design.front.length ? art.design.front : art.design.back).map(layer => <ArtworkLayer key={layer.id} layer={layer}/>)}</svg>{art.id.startsWith("studio-") ? "Studio proof" : art.id}</div></th>
        <td>{art.orderId ? <Link href={"/admin/orders/" + art.orderId}>{art.orderId}</Link> : "Studio design"}</td><td>{artworkCustomer(data, art)}</td>
        <td>{data.products.find(product => product.id === art.productId)?.name}</td><td>{art.placement}</td><td>{formatDate(art.date)}</td>
        <td><Badge label={art.status}/></td><td><Badge label={art.priority}/></td><td><Link href={"/admin/artwork/" + art.id}>Review</Link></td>
      </tr>)}</tbody></table></div> : <Empty title="No artwork matches"/>}
    </Panel>
  </>;
}

function FileMetadata({ file }: { file: File }) {
  const [dimensions, setDimensions] = useState<{ file: File; label: string }>();
  useEffect(() => {
    let mounted = true;
    createImageBitmap(file).then(bitmap => {
      const label = bitmap.width + " × " + bitmap.height + " px";
      bitmap.close();
      if (mounted) setDimensions({ file, label });
    }).catch(() => { if (mounted) setDimensions({ file, label: "Unavailable" }); });
    return () => { mounted = false; };
  }, [file]);
  return <li><strong>{file.name}</strong><p>{file.type} · {dimensions?.file === file ? dimensions.label : "Reading dimensions…"}</p></li>;
}
const actionLabels: Partial<Record<ArtStage, string>> = {
  "Under Review": "Start review", Approved: "Approve Artwork",
  "Revision Required": "Request Revision", "Awaiting Customer Approval": "Send Proof for Approval (Demo)", Rejected: "Reject Artwork",
};

export function ArtworkDetails({ id }: { id: string }) {
  const { data, reviewArtwork, update } = useAdmin();
  const [message, setMessage] = useState("");
  const item = data.artwork.find(item => item.id === id);
  if (!item) return <MissingRecord type="Artwork" back="/admin/artwork"/>;
  const order = data.orders.find(order => order.id === item.orderId);
  const actions = order?.status === "Cancelled" ? [] : allowedArtworkStages(item);
  const images = [...item.design.front, ...item.design.back].filter(layer => layer.kind === "image");
  function review(status: ArtStage) {
    const confirmation = status === "Awaiting Customer Approval" ? "Demo proof recorded. No customer notification was sent." : "Artwork status updated to " + status + ".";
    reviewArtwork(id, status, confirmation);
    setMessage(confirmation);
  }

  return <><AdminHeading title={id.startsWith("studio-") ? "Studio proof" : id} description={artworkCustomer(data, item) + " · Illustrative garment proof"}
    actions={<><Badge label={item.status}/><Link className="ad-button secondary" href="/admin/artwork">Review queue</Link></>}/>
    <div className="ad-review-grid">
      <Panel title="Inspect artwork"><ProofPreview item={item} controls/></Panel>
      <div>
        <Panel title="File & placement">
          <dl className="ad-info">
            <div><dt>Order</dt><dd>{item.orderId ? <Link className="ad-link" href={"/admin/orders/" + item.orderId}>{item.orderId}</Link> : "Unlinked studio proof"}</dd></div>
            <div><dt>Product</dt><dd>{data.products.find(product => product.id === item.productId)?.name}</dd></div>
            <div><dt>Placement</dt><dd>{item.placement}</dd></div><div><dt>Printing method</dt><dd>{item.method}</dd></div>
            <div><dt>Source</dt><dd>{images.length ? "Local artwork files" : "Illustrative text layers"}</dd></div>
          </dl>
          {images.length > 0 && <ul className="ad-notes">{images.map((image, index) => <FileMetadata key={image.id + index} file={image.file}/>)}</ul>}
          <p className="ad-spaced">Preview inspection requires a production suitability check before printing.</p>
        </Panel>
        <Panel title="Review decision"><p>Decisions and proof requests update this demo only.</p>
          <div className="ad-actions ad-spaced">
            {actions.map(status => status === "Rejected" ? <Confirm key={status} label="Reject Artwork" title="Reject this proof?" detail="This records a rejection in the current demo." onConfirm={() => review(status)}/> :
              <button type="button" key={status} className={"ad-button " + (status === "Approved" ? "primary" : "secondary")} onClick={() => review(status)}>{actionLabels[status]}</button>)}
            {!actions.length && <Badge label={item.status}/>}
          </div><p role="status" className="ad-spaced">{message}</p>
        </Panel>
        <Notes label="Review notes" notes={item.notes} onAdd={text => update(current => ({ ...current, artwork: current.artwork.map(entry => entry.id === id ? { ...entry, notes: [...entry.notes, note(text)] } : entry) }))}/>
      </div>
    </div>
  </>;
}