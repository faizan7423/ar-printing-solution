import { categories as storefrontCategories, products, printMethods } from "@/data/catalogue";
import type { Design } from "@/components/shop/CartState";

export const orderStages = [
  "Order Received", "Artwork Review", "Awaiting Customer Approval", "Approved",
  "Production Queue", "Printing in Progress", "Quality Check", "Packed", "Shipped", "Delivered", "Cancelled",
] as const;
export const artworkStages = ["Pending Review", "Under Review", "Revision Required", "Awaiting Customer Approval", "Approved", "Rejected"] as const;
export const quoteStages = ["New", "Under Review", "Awaiting Customer Information", "Quotation Prepared", "Quotation Sent", "Accepted", "Declined", "Closed"] as const;
export const paymentStates = ["Pending", "Paid", "Partial", "Refunded"] as const;
export const productStates = ["Visible", "Draft", "Archived"] as const;
export const roles = ["Owner", "Administrator", "Sales Executive", "Artwork Designer", "Production Staff", "Inventory Manager"] as const;
export const permissions = ["View orders", "Manage orders", "Manage products", "Manage pricing", "Approve artwork", "Manage quotations", "Manage inventory", "View analytics", "Manage staff", "Manage settings"] as const;
export type OrderStage = typeof orderStages[number];
export type ArtStage = typeof artworkStages[number];
export type QuoteStage = typeof quoteStages[number];
export type ProductState = typeof productStates[number];
export type Permission = typeof permissions[number];
export type Role = typeof roles[number];
export type Note = { text: string; date: string };
export type Customer = { id: string; name: string; type: "Business" | "Individual"; email: string; phone: string; status: "Active" | "Inactive"; notes: Note[] };
export type ProductRecord = {
  id: string; name: string; sku: string; categoryId: string; status: ProductState; description: string; image: string;
  files: File[]; colours: string[]; sizes: string[]; methods: string[]; placements: string[]; fabric: string;
  price: number; minimum: number; threshold: number; openingStock: number; seoTitle: string; seoDescription: string;
};
export type Variant = { id: string; productId: string; sku: string; colour: string; size: string; available: number; reserved: number; threshold: number; active: boolean };
export type CategoryRecord = { id: string; name: string; description: string; visibility: "Visible" | "Hidden" | "Archived" };
export type OrderItem = { productId: string; productName: string; quantity: number; colour: string; size: string; method: string; value: number };
export type ProductionTask = { due: string; staffId: string; priority: "Normal" | "High" };
export type Order = {
  id: string; customerId: string; date: string; item: OrderItem; payment: typeof paymentStates[number]; status: OrderStage;
  delivery: string; notes: Note[]; timeline: { status: OrderStage; date: string }[]; task: ProductionTask;
};
export type ArtworkRecord = {
  id: string; orderId?: string; productId: string; customerLabel?: string; date: string; status: ArtStage; priority: "Normal" | "High";
  placement: "Front" | "Back" | "Front & back"; method: string; colour: string; design: Design; notes: Note[];
};
export type QuoteLine = { description: string; quantity: number; unitPrice: number; printing: number; extras: number; discount: number; tax: number };
export type Quote = {
  id: string; customerId: string; date: string; staffId: string; service: string; status: QuoteStage;
  garment: string; fabric: string; artwork: string; line: QuoteLine; notes: Note[];
};
export type Staff = { id: string; name: string; email: string; role: Role; status: "Active" | "Inactive" };
export type Pricing = { methods: Record<string, number>; front: number; back: number; additional: number; setup: number; tierQuantity: number; tierDiscount: number; bulkQuantity: number; bulkDiscount: number; tax: number; shipping: number };
export type Movement = { id: string; variantId: string; delta: number; reason: string; date: string };
export type AdminData = {
  orders: Order[]; artwork: ArtworkRecord[]; products: ProductRecord[]; variants: Variant[]; categories: CategoryRecord[];
  customers: Customer[]; quotes: Quote[]; staff: Staff[]; rolePermissions: Record<Role, Permission[]>;
  pricing: Pricing; movements: Movement[]; content: Record<string, string>; settings: Record<string, string>; galleryFiles: File[];
};

export function newProduct(): ProductRecord {
  return { id: "", name: "", categoryId: "t-shirts", sku: "", status: "Draft", description: "", files: [], image: "tees",
    colours: ["Chalk"], sizes: ["M"], methods: [], placements: ["Front"], fabric: "", price: 0, minimum: 1,
    threshold: 5, openingStock: 0, seoTitle: "", seoDescription: "" };
}
export function buildVariants(product: ProductRecord): Variant[] {
  return product.colours.flatMap(colour => product.sizes.map(size => ({
    id: [product.id, colour.toLowerCase(), size.toLowerCase()].join("|"), productId: product.id,
    sku: [product.sku, colour.toUpperCase().replaceAll(" ", "-"), size].join("-"),
    colour, size, available: product.openingStock, reserved: 0, threshold: product.threshold, active: true,
  })));
}

export function makeDemoData(): AdminData {
  const customerData = [
    ["Atlas Studio (Demo)", "Business", "atlas"], ["Mira Demo", "Individual", "mira"], ["Juniper Club (Demo)", "Business", "juniper"],
    ["Noah Demo", "Individual", "noah"], ["Cedar Events (Demo)", "Business", "cedar"],
  ] as const;
  const customers: Customer[] = customerData.map(([name, type, key], index) => ({
    id: "CUS-" + (101 + index), name, type, status: index === 4 ? "Inactive" : "Active",
    email: key + "@example.test", phone: "+91 00000 0000" + index, notes: [],
  }));
  const staff: Staff[] = roles.map((role, index) => ({
    id: "STAFF-" + index, name: ["Ari Demo", "Sam Demo", "Ira Demo", "Dev Demo", "Tara Demo", "Rin Demo"][index],
    email: "staff" + index + "@example.test", role, status: "Active",
  }));
  const productRows = products.map((product, index): ProductRecord => ({
    ...newProduct(), id: product.id, name: product.name, description: product.description, categoryId: product.category,
    sku: "DM-" + (101 + index), price: 220 + 45 * index, image: product.image, status: index === 7 ? "Draft" : "Visible",
    colours: product.colourChoices.map(colour => colour.name), sizes: product.category === "t-shirts" ? ["S", "M", "L", "XL", "XXL"] : ["One size"],
    methods: [...printMethods.slice(1)], placements: ["Front", "Back"], seoTitle: product.name,
  }));
  const sampleStatuses: OrderStage[] = ["Order Received", "Artwork Review", "Awaiting Customer Approval", "Approved",
    "Production Queue", "Printing in Progress", "Quality Check", "Packed", "Shipped", "Delivered", "Delivered", "Cancelled", "Delivered", "Delivered", "Artwork Review", "Delivered", "Delivered"];
  const orders = sampleStatuses.map((status, index): Order => {
    const product = productRows[index % productRows.length];
    const date = ["2026-11-26","2026-11-25","2026-11-24","2026-11-23","2026-11-21","2026-11-18","2026-11-16","2026-11-12","2026-11-09","2026-11-05","2026-10-28","2026-10-22","2026-10-16","2026-10-08","2026-09-24","2026-09-15","2026-09-04"][index];
    const quantity = [6, 25, 32, 45, 18, 12, 25][index % 7];
    const colour = product.colours[index % product.colours.length];
    const size = product.sizes[index % product.sizes.length];
    const history = status === "Cancelled" ? ["Order Received", "Cancelled"] as const : orderStages.slice(0, orderStages.indexOf(status) + 1);
    return {
      id: "DEMO-" + (2082 - index), customerId: customers[index % customers.length].id, date, status,
      item: { productId: product.id, productName: product.name, quantity, colour, size, method: product.methods[index % product.methods.length], value: (product.price + 55) * quantity },
      payment: index > 2 ? (status === "Cancelled" ? "Refunded" : "Paid") : index === 2 ? "Partial" : "Pending",
      delivery: (index + 5) + " Example Lane, Demonstration City 000000",
      task: { staffId: staff[4].id, due: "2026-12-" + String(index % 12 + 1).padStart(2, "0"), priority: index % 3 === 1 ? "High" : "Normal" },
      notes: [], timeline: history.map(step => ({ status: step, date })),
    };
  });
  const artwork = orders.map((order, index): ArtworkRecord => ({
    id: "ART-" + (401 + index), orderId: order.id, productId: order.item.productId, date: order.date,
    status: (["Pending Review", "Pending Review", "Awaiting Customer Approval", "Approved"] as const)[Math.min(index, 3)],
    priority: order.task.priority, colour: order.item.colour, placement: index % 2 ? "Front" : "Front & back", method: order.item.method,
    design: {
      front: [{ id: "front", kind: "text", text: index % 2 ? "JUNIPER" : "ATLAS STUDIO", ink: "#ef7648", font: "Sans serif", width: 125, x: 200, y: 183, angle: 0 }],
      back: index % 2 ? [] : [{ id: "back", kind: "text", text: "EDITION 26", ink: "#ef7648", font: "Monospace", width: 109, x: 200, y: 170, angle: 0 }],
    }, notes: [],
  }));
  const quotes = [0, 1, 2, 3, 4, 5].map((index): Quote => ({
    id: "QT-" + (310 + index), customerId: customers[(index * 2) % customers.length].id,
    date: "2026-11-" + (26 - index * 3), staffId: staff[2].id, service: printMethods[1 + index % 3],
    status: ["New", "New", "Under Review", "Quotation Sent", "Accepted", "Declined"][index] as QuoteStage,
    garment: index % 2 ? "Polo shirt" : "Round-neck T-shirt", fabric: "Sample material pending review",
    artwork: "Fictional brand mark submitted for placement review.", notes: [],
    line: { description: "Garment supply and print", quantity: 48 + index * 12, unitPrice: 240, printing: 1200, extras: 0, discount: 0, tax: 0 },
  }));
  return {
    customers, staff, orders, artwork, quotes, products: productRows,
    variants: productRows.flatMap(buildVariants).map((variant, index) => ({ ...variant, available: index % 17 === 0 ? 3 : 14 + index % 61, reserved: index % 5 })),
    categories: storefrontCategories.map(category => ({ ...category, description: category.name + " catalogue", visibility: "Visible" })),
    rolePermissions: {
      Owner: [...permissions], Administrator: [...permissions], "Sales Executive": ["View orders", "Manage quotations"],
      "Artwork Designer": ["View orders", "Approve artwork"], "Production Staff": ["View orders", "Manage orders"], "Inventory Manager": ["Manage inventory"],
    },
    pricing: { methods: Object.fromEntries(printMethods.slice(1).map((method, index) => [method, 25 + index * 15])),
      front: 15, back: 20, additional: 10, setup: 120, tierQuantity: 25, tierDiscount: 5, bulkQuantity: 100, bulkDiscount: 10, tax: 0, shipping: 60 },
    movements: [], content: {}, settings: {}, galleryFiles: [],
  };
}

export function formatMoney(amount: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount); }
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(date));
}
export function allowedOrderStages(order: Order, artwork: ArtworkRecord[]) {
  const index = orderStages.indexOf(order.status);
  if (order.status === "Cancelled" || order.status === "Delivered") return [];
  const next = orderStages[index + 1];
  const artStatus = artwork.find(item => item.orderId === order.id)?.status;
  const readyToAdvance = next === "Approved" ? artStatus === "Approved" :
    next === "Awaiting Customer Approval" ? artStatus === "Awaiting Customer Approval" || artStatus === "Approved" : true;
  return [...(readyToAdvance ? [next] : []), ...(index < orderStages.indexOf("Shipped") ? ["Cancelled" as const] : [])];
}
export function quoteTotals(line: QuoteLine) {
  const round = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;
  const subtotal = round(line.quantity * line.unitPrice + line.printing + line.extras);
  const taxable = Math.max(0, round(subtotal - line.discount));
  const tax = round(taxable * line.tax / 100);
  return { subtotal, tax, total: round(taxable + tax) };
}