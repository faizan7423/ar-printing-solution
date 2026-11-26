"use client";

import { useState } from "react";
import { ArtworkLayer } from "@/components/shop/ArtworkLayer";
import { ProductMockup, printBounds } from "@/components/shop/ProductMockup";
import type { Side } from "@/components/shop/CartState";
import { colours, defaultProduct, products } from "@/data/catalogue";
import type { ArtworkRecord } from "@/data/admin";

export function ProofPreview({ item, controls = false }: { item: ArtworkRecord; controls?: boolean }) {
  const [side, setSide] = useState<Side>(item.placement === "Back" ? "back" : "front");
  const [zoom, setZoom] = useState(100);
  const [boundary, setBoundary] = useState(true);
  const [artworkOnly, setArtworkOnly] = useState(false);
  const product = products.find(product => product.id === item.productId) ?? defaultProduct;
  const colour = colours.find(option => option.name === item.colour)?.hex ?? colours[0].hex;
  const layers = item.design[side].map(layer => <ArtworkLayer key={layer.id} layer={layer}/>);
  return <div className="ad-proof">
    <div className="ad-proof-tools">
      {(["front", "back"] as const).map(view => <button type="button" className="ad-button secondary" key={view} aria-pressed={side === view} onClick={() => setSide(view)}>{view === "front" ? "Front" : "Back"}</button>)}
      {controls && <><button type="button" className="ad-button secondary" aria-pressed={artworkOnly} onClick={() => setArtworkOnly(!artworkOnly)}>Artwork only</button>
        <label className="ad-inline-check"><input type="checkbox" checked={boundary} onChange={event => setBoundary(event.target.checked)}/> Print boundary</label>
        <label className="ad-zoom">Zoom {zoom}%<input type="range" min={75} max={225} step={25} value={zoom} onChange={event => setZoom(Number(event.target.value))}/></label></>}
    </div>
    <div className="ad-proof-view">
      <div style={{ width: zoom + "%" }}>
        {artworkOnly ? <svg viewBox="112 110 176 200" className="mockup" aria-label={side + " artwork only"}>{layers}</svg> :
          <ProductMockup product={product} colour={colour} side={side}>
            {controls && boundary && <rect x={printBounds.left} y={printBounds.top} width={printBounds.width} height={printBounds.height} fill="none" stroke="#008991" strokeWidth="2" strokeDasharray="5 4"/>}{layers}
          </ProductMockup>}
      </div>
    </div>
    {!layers.length && <p>No artwork on this side.</p>}
  </div>;
}