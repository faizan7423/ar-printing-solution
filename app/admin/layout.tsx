import { AdminProvider } from "@/components/admin/AdminState";

export const metadata = { title: { default: "Admin Portal", template: "%s | AR Printing Admin" }, robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>;
}