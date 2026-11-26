import { Suspense } from "react";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { makeDemoData } from "@/data/admin";
export const metadata = { title: "Edit Product" };
type Props = { params: Promise<{ id: string }> };
export function generateStaticParams() { return makeDemoData().products.map(({ id }) => ({ id })); }
async function RecordPage({ params }: Props) { const { id } = await params; return <ProductEditor id={id}/>; }
export default function Page(props: Props) { return <Suspense fallback={<p>Loading demo record…</p>}><RecordPage {...props}/></Suspense>; }