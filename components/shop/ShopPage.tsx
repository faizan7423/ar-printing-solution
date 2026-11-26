import { Suspense } from "react";
import { Catalogue } from "./Catalogue";
import { Breadcrumb } from "./ShopShared";

export function ShopPage({ teesOnly = false }: { teesOnly?: boolean }) {
  return <div className="shop-page">
    <div className="shop-intro"><div className="container">
      <Breadcrumb items={teesOnly ? [["Shop", "/shop"], ["T-shirts"]] : [["Shop"]]} />
      <h1>{teesOnly ? "Custom T-shirts" : "Custom apparel & accessories"}</h1>
      <p>Explore proposed styles and personalise a sample design. Catalogue options are illustrative and subject to client confirmation.</p>
    </div></div>
    <section className="container shop-body" aria-label="Product catalogue">
      <Suspense fallback={<p>Loading catalogue…</p>}><Catalogue teesOnly={teesOnly} /></Suspense>
    </section>
  </div>;
}