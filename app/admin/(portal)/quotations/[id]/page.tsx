import { Suspense } from "react";
import { QuoteDetails } from "@/components/admin/Quotations";
import { makeDemoData } from "@/data/admin";
export const metadata = { title: "Quotation Details" };
type Props = { params: Promise<{ id: string }> };
export function generateStaticParams() { return makeDemoData().quotes.map(({ id }) => ({ id })); }
async function RecordPage({ params }: Props) { const { id } = await params; return <QuoteDetails id={id}/>; }
export default function Page(props: Props) { return <Suspense fallback={<p>Loading demo record…</p>}><RecordPage {...props}/></Suspense>; }