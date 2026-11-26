import { Suspense } from "react";
import { CustomerDetails } from "@/components/admin/Customers";
import { makeDemoData } from "@/data/admin";
export const metadata = { title: "Customer Details" };
type Props = { params: Promise<{ id: string }> };
export function generateStaticParams() { return makeDemoData().customers.map(({ id }) => ({ id })); }
async function RecordPage({ params }: Props) { const { id } = await params; return <CustomerDetails id={id}/>; }
export default function Page(props: Props) { return <Suspense fallback={<p>Loading demo record…</p>}><RecordPage {...props}/></Suspense>; }