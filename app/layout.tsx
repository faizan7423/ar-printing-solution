import type { Metadata } from "next";
import { brand } from "@/data/brand";
import { company } from "@/data/site";
import { CartProvider } from "@/components/shop/CartState";
import { AccountProvider } from "@/components/account/AccountState";
import "./globals.css";
import "./shop.css";
import "./studio.css";
import "./account.css";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Garment & Textile Printing | " + company.name, template: "%s | " + company.name },
  description: company.intro, robots: { index: false, follow: false },
  openGraph: { title: company.name, description: company.intro, type: "website" }, icons: { icon: brand.logo.src },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><CartProvider><AccountProvider>{children}</AccountProvider></CartProvider></body></html>;
}