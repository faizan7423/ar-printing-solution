import { colours, products } from "@/data/catalogue";
import type { Design, Selection } from "@/components/shop/CartState";

export const accountLinks = [
  ["My Account", "/account"], ["My Orders", "/account/orders"],
  ["Saved Designs", "/account/designs"], ["Saved Addresses", "/account/addresses"],
  ["Profile Settings", "/account/profile"], ["Wishlist", "/account/wishlist"],
] as const;

export const demoProfile = { name: "Sample Customer", email: "customer@example.test", mobile: "+91 00000 00000" };

export const orderStatuses = ["Order Received", "Artwork Review", "Awaiting Approval", "Printing in Progress", "Quality Check", "Shipped", "Delivered"] as const;
export type Order = {
  id: string;
  productId: string;
  date: string;
  status: typeof orderStatuses[number];
  selection: Selection;
  design: Design;
};

export const demoOrders: readonly Order[] = [
  {
    id: "DEMO-1042", productId: "classic-round-neck", date: "18 Nov 2026", status: "Awaiting Approval",
    selection: { colour: colours[2], size: "L", quantity: 12, placement: "Front & back", method: "Screen Printing" },
    design: {
      front: [{ id: "front", kind: "text", x: 200, y: 180, width: 111, angle: 0, text: "TRAIL CLUB", font: "Sans serif", ink: "#f0eedc" }],
      back: [{ id: "back", kind: "text", x: 200, y: 202, width: 120, angle: 0, text: "OUTDOOR SERIES", font: "Monospace", ink: "#f0eedc" }],
    },
  },
  {
    id: "DEMO-1036", productId: "custom-printed", date: "04 Nov 2026", status: "Delivered",
    selection: { colour: colours[0], size: "M", quantity: 6, placement: "Front", method: "Offset Heat Transfer Printing" },
    design: { front: [{ id: "front", kind: "text", x: 200, y: 180, width: 100, angle: 0, text: "STUDIO EDIT", font: "Serif", ink: "#243a5b" }], back: [] },
  },
];

export type Address = { id: string; label: string; recipient: string; street: string; city: string; postal: string; primary: boolean };
export const demoAddresses: Address[] = [
  { id: "demo-address", label: "Sample studio", recipient: "Sample Customer", street: "10 Example Lane", city: "Demonstration City", postal: "000000", primary: true },
];

const approvedPaths = new Set<string>([
  "/", "/shop", "/shop/t-shirts", "/checkout", "/cart", "/customize/t-shirt", "/services", "/about",
  ...accountLinks.map(([, href]) => href),
  ...demoOrders.map(order => "/account/orders/" + order.id),
  ...products.map(product => "/shop/" + product.category + "/" + product.id),
]);

export function returnDestination(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/u.test(value)) return "/account";
  const url = new URL(value, "https://demo.example");
  return url.origin === "https://demo.example" && approvedPaths.has(url.pathname)
    ? url.pathname + url.search + url.hash : "/account";
}
export function authLink(route: "/sign-in" | "/sign-up" | "/forgot-password", next?: string | null) {
  return next ? route + "?next=" + encodeURIComponent(returnDestination(next)) : route;
}