import { Suspense } from "react";
import { AdminSignIn } from "@/components/admin/AdminSignIn";
export default function Page() { return <Suspense fallback={<p>Loading admin sign-in…</p>}><AdminSignIn/></Suspense>; }