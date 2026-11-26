import { Checkout } from "@/components/shop/Checkout";
import { Breadcrumb } from "@/components/shop/ShopShared";

export const metadata = { title: "Demo Checkout" };
export default function Page() {
  return <div className="container shop-body studio-page">
    <Breadcrumb items={[["Shop", "/shop"], ["Cart", "/cart"], ["Checkout"]]} />
    <h1>Demo checkout.</h1><p>Use sample details to try the workflow. This form sends no information and accepts no payments.</p>
    <Checkout />
  </div>;
}