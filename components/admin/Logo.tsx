import Image from "next/image";
import { brand } from "@/data/brand";
export function AdminLogo() { return <span className="ad-logo"><Image {...brand.logo} alt="AR Printing Solution" unoptimized/></span>; }