import { Suspense } from "react";
import { OrderDetails } from "@/components/admin/Orders";
import { makeDemoData } from "@/data/admin";
export const metadata = { title: "Order Details" };
type Props = { params: Promise<{ id: string }> };
export function generateStaticParams() { return makeDemoData().orders.map(({ id }) => ({ id })); }
async function RecordPage({ params }: Props) { const { id } = await params; return <OrderDetails id={id}/>; }
export default function Page(props: Props) { return <Suspense fallback={<p>Loading demo record…</p>}><RecordPage {...props}/></Suspense>; }