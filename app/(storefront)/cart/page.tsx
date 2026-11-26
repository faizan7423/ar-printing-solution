import { CartPage } from "@/components/shop/CartPage";
import { Breadcrumb } from "@/components/shop/ShopShared";
export const metadata = { title: "Demo Cart" };
export default function Page() {
  return <div className="container shop-body studio-page">
    <Breadcrumb items={[["Shop", "/shop"], ["Cart"]]} /><h1>Your demo cart.</h1>
    <CartPage />
  </div>;
}