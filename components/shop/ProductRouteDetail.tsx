"use client";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/data/catalogue";
import { ProductDetail } from "./ProductDetail";

export function ProductRouteDetail({ product }: { product: Product }) {
  const edit = useSearchParams().get("edit");
  return <ProductDetail key={product.id + ":" + edit} product={product} editId={edit ?? undefined} />;
}