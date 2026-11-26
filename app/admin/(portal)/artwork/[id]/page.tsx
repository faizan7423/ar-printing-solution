import { Suspense } from "react";
import { ArtworkDetails } from "@/components/admin/Artwork";
import { makeDemoData } from "@/data/admin";
export const metadata = { title: "Artwork Review" };
type Props = { params: Promise<{ id: string }> };
export function generateStaticParams() { return makeDemoData().artwork.map(({ id }) => ({ id })); }
async function RecordPage({ params }: Props) { const { id } = await params; return <ArtworkDetails id={id}/>; }
export default function Page(props: Props) { return <Suspense fallback={<p>Loading demo record…</p>}><RecordPage {...props}/></Suspense>; }