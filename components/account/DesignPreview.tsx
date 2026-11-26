import { ProductMockup } from "@/components/shop/ProductMockup";
import { ArtworkLayer } from "@/components/shop/ArtworkLayer";
import type { Design, Selection } from "@/components/shop/CartState";
import type { Product } from "@/data/catalogue";

export function DesignPreview({ product, selection, design }: { product: Product; selection: Selection; design: Design }) {
  return <div className="account-design-preview">
    {(["front", "back"] as const).map(side => <figure key={side}>
      <ProductMockup product={product} colour={selection.colour.hex} side={side}>{design[side].map(layer => <ArtworkLayer key={layer.id} layer={layer}/>)}</ProductMockup>
      <figcaption>{side}{!design[side].length && " · no artwork"}</figcaption>
    </figure>)}
  </div>;
}