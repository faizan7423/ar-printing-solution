import { Activity, Boxes, ChartNoAxesCombined, CircleDollarSign, ClipboardList, FileText, Image, LayoutDashboard, Package, PanelsTopLeft, Settings, Tags, UserRound, UsersRound } from "lucide-react";

export const adminNav = [
  { label: "Overview", entries: [{ label: "Dashboard", href: "/admin", Icon: LayoutDashboard }] },
  { label: "Sales", entries: [{ label: "Orders", href: "/admin/orders", Icon: ClipboardList }, { label: "Quotations", href: "/admin/quotations", Icon: FileText }, { label: "Customers", href: "/admin/customers", Icon: UserRound }] },
  { label: "Catalogue", entries: [{ label: "Products", href: "/admin/products", Icon: Package }, { label: "Categories", href: "/admin/categories", Icon: Tags }, { label: "Inventory", href: "/admin/inventory", Icon: Boxes }, { label: "Pricing", href: "/admin/pricing", Icon: CircleDollarSign }] },
  { label: "Production", entries: [{ label: "Artwork Approvals", href: "/admin/artwork", Icon: Image }, { label: "Production Queue", href: "/admin/production", Icon: Activity }] },
  { label: "Website", entries: [{ label: "Content Management", href: "/admin/content", Icon: PanelsTopLeft }] },
  { label: "Administration", entries: [{ label: "Analytics", href: "/admin/analytics", Icon: ChartNoAxesCombined }, { label: "Staff", href: "/admin/staff", Icon: UsersRound }, { label: "Settings", href: "/admin/settings", Icon: Settings }] },
];

export const adminLinks = adminNav.flatMap(group => group.entries);

export function approvedAdminReturn(value: string | null) {
  if (!value) return "/admin";
  if (adminLinks.some(item => item.href === value) || value === "/admin/products/new") return value;
  return /^\/admin\/(?:(?:orders|artwork|quotations|customers)\/[a-z0-9-]+|products\/[a-z0-9-]+\/edit)$/i.test(value) ? value : "/admin";
}