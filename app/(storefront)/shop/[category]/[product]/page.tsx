import { Suspense } from "react";
import { notFound } from "next/navigation";
import { categories, categoryUrl, products } from "@/data/catalogue";
import { Breadcrumb, ProductCard } from "@/components/shop/ShopShared";
import { ProductRouteDetail } from "@/components/shop/ProductRouteDetail";

type Props = { params: Promise<{ category: string; product: string }> };
export function generateStaticParams() {
  return products.map(product => ({ category: product.category, product: product.id }));
}
export async function generateMetadata({ params }: Props) {
  const { category, product } = await params;
  const item = products.find(item => item.id === product && item.category === category);
  return { title: item?.name ?? "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { category, product } = await params;
  const item = products.find(item => item.id === product && item.category === category);
  if (!item) notFound();
  const group = categories.find(group => group.id === item.category)!;
  const related = products.filter(product => product.id !== item.id && product.category === item.category);
  return <div className="container shop-body product-page">
    <Breadcrumb items={[["Shop", "/shop"], [group.name, categoryUrl(group.id)], [item.name]]} />
    <Suspense fallback={<p>Loading product options…</p>}><ProductRouteDetail product={item} /></Suspense>
    <section className="product-info" aria-label="Product information">
      <details open><summary>Product details</summary><p>{item.description} Colours and sizes shown are demo configurations.</p></details>
      <details><summary>Printing options</summary><p>Artwork, print location and the selected garment guide the choice of method. Final print suitability is reviewed during sampling.</p></details>
      <details><summary>Artwork guidance</summary><p>Use a sharp original image or logo. The T-shirt studio accepts PNG, JPEG and WebP images up to 10 MB.</p></details>
      <details><summary>Ordering information</summary><p>Price on Request. Product supply, final print proof and delivery arrangements are subject to client confirmation.</p></details>
    </section>
    <section className="related-products"><h2>Related products</h2><div className="product-grid">{(related.length ? related : products.filter(product => product.id !== item.id)).slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}</div></section>
  </div>;
}