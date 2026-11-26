import { Suspense } from "react";
import { Breadcrumb } from "@/components/shop/ShopShared";
import { Studio } from "@/components/shop/Studio";

export const metadata = { title: "T-shirt Design Studio" };
export default function Page() {
  return <div className="container shop-body studio-page">
    <Breadcrumb items={[["Shop", "/shop"], ["T-shirts", "/shop/t-shirts"], ["Design Studio"]]} />
    <h1>T-shirt design studio.</h1>
    <p>Build an illustrative print preview for both sides of your T-shirt.</p>
    <Suspense fallback={<p>Loading design tools…</p>}><Studio /></Suspense>
  </div>;
}