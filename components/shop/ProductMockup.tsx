import { useId, type ReactNode } from "react";
import type { Product } from "@/data/catalogue";
import type { Side } from "./CartState";

const shirt = "M140 54 L104 62 38 112 70 166 111 145 107 340 Q200 353 293 340 L289 145 330 166 362 112 296 62 260 54 Q200 76 140 54Z";
const silhouettes: Record<Product["category"], string> = {
  "t-shirts": shirt,
  bags: "M94 130 H306 L323 342 H77Z",
  caps: "M73 224 Q68 102 187 100 Q270 98 304 206 Q357 213 369 242 Q351 278 277 276 L237 255 Q118 253 73 224Z",
  jackets: "M149 51 L106 65 62 105 27 308 88 319 112 174 107 345 H293 L288 174 312 319 373 308 338 105 294 65 251 51Z",
};
export const printBounds = { left: 127, top: 125, width: 146, height: 168 };

export function ProductMockup({ product, colour, side, children, svgRef }: {
  product: Product; colour: string; side: Side; children?: ReactNode; svgRef?: React.Ref<SVGSVGElement>;
}) {
  const shade = useId();
  const collar = side === "back" ? "M140 54 Q200 88 260 54" : "M140 54 Q200 118 260 54";
  return <svg ref={svgRef} className="mockup" viewBox="0 0 400 400" aria-label={side + " illustration of " + product.name}>
    <defs><linearGradient id={shade} x2="1" y2="1"><stop stopColor="white" stopOpacity=".14"/><stop offset=".6" stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="black" stopOpacity=".22"/></linearGradient></defs>
    <ellipse cx="200" cy="356" rx="120" ry="12" fill="#152832" opacity=".08" />
    {product.category === "bags" && <path d="M143 145 V105 C143 41 257 41 257 105 V145" stroke={colour} strokeWidth="17" fill="none"/>}
    <path d={silhouettes[product.category]} fill={colour} stroke="#152832" strokeOpacity=".3" strokeWidth="2"/>
    <path d={silhouettes[product.category]} fill={"url(#" + shade + ")"}/>
    {product.category === "t-shirts" && <g fill="none" stroke="#152832" strokeOpacity=".36" strokeWidth="3">
      <path d={collar}/><path d="M47 111 L76 158 M353 111 L324 158 M113 330 Q200 343 287 330" opacity=".52"/>
      {side === "front" && product.id === "polo" && <path d="M145 57 L172 108 199 79 228 108 255 57 M200 81 V129"/>}
      {product.id === "sports" && <path d="M104 63 L114 146 M296 63 L286 146"/>}
    </g>}
    {product.category === "jackets" && <path d={side === "front" ? "M149 51 Q200 104 251 51 M200 77 V344 M124 282 L165 257 M276 282 L235 257" : "M149 51 Q200 82 251 51 M112 151 H288"} stroke="#152832" strokeOpacity=".45" strokeWidth="3" fill="none"/>}
    {product.category === "caps" && <path d={side === "front" ? "M184 103 Q226 111 241 222 M74 224 Q190 241 304 206" : "M144 243 Q154 199 218 206 Q250 208 259 246"} fill="none" stroke="#152832" strokeOpacity=".45" strokeWidth="3"/>}
    {children}
  </svg>;
}