export const categories = [
  { id: "t-shirts", name: "T-shirts", image: "tees" },
  { id: "bags", name: "Bags", image: "bags" },
  { id: "caps", name: "Caps", image: "caps" },
  { id: "jackets", name: "Jackets", image: "jackets" },
] as const;

export const colours = [
  { name: "Chalk", hex: "#ede9de" }, { name: "Charcoal", hex: "#27333d" },
  { name: "Forest", hex: "#315b50" }, { name: "Blue", hex: "#345784" },
] as const;
export const sizes = ["S", "M", "L", "XL", "XXL"] as const;
export const placements = ["Front", "Back", "Front & back"] as const;
export const printMethods = ["Please advise", "Screen Printing", "Offset Heat Transfer Printing", "Sublimation Printing"] as const;
export type Colour = typeof colours[number];
export type Category = typeof categories[number]["id"];
export type Product = {
  id: string; category: Category; name: string; description: string;
  image: string; colourChoices: readonly Colour[];
};

const [chalk, charcoal, forest, blue] = colours;

export const products: readonly Product[] = [
  { id: "classic-round-neck", category: "t-shirts", name: "Classic Round-neck T-shirt", image: "tees", colourChoices: colours, description: "A clean round-neck silhouette for personal designs and event artwork." },
  { id: "premium-round-neck", category: "t-shirts", name: "Premium Round-neck T-shirt", image: "tee-premium", colourChoices: [chalk, charcoal, forest], description: "An understated base for a collection, campaign or brand identity." },
  { id: "polo", category: "t-shirts", name: "Polo T-shirt", image: "tee-polo", colourChoices: [chalk, charcoal, blue], description: "A collared apparel concept for staff, clubs and team branding." },
  { id: "sports", category: "t-shirts", name: "Sports T-shirt", image: "tee-sports", colourChoices: [chalk, blue, forest], description: "An athletic styling concept for team names, graphics and numbers." },
  { id: "custom-printed", category: "t-shirts", name: "Custom Printed T-shirt", image: "tee-custom", colourChoices: colours, description: "Start with a blank canvas and make it yours with text or artwork." },
  { id: "custom-tote", category: "bags", name: "Custom Tote Bag", image: "bags", colourChoices: [chalk, charcoal], description: "A carryall concept with space for bold artwork or a brand mark." },
  { id: "custom-cap", category: "caps", name: "Custom Cap", image: "caps", colourChoices: [chalk, charcoal, blue], description: "A headwear concept for a compact logo or a graphic accent." },
  { id: "custom-jacket", category: "jackets", name: "Custom Jacket", image: "jackets", colourChoices: [charcoal, blue, forest], description: "An outerwear concept for team or business graphics." },
];
export const defaultProduct = products[0];
export const productUrl = (product: Product) => '/shop/' + product.category + '/' + product.id;
export const categoryUrl = (id: Category) => id === "t-shirts" ? "/shop/t-shirts" : "/shop?category=" + id;
export const featured = [products[0], products[5], products[6], products[7]];
export const shopMenu = [
  ["Custom T-shirts", "/shop/t-shirts"],
  ["Round-neck T-shirts", productUrl(products[0])],
  ["Polo T-shirts", productUrl(products[2])],
  ["Sports T-shirts", productUrl(products[3])],
  ["Custom Bags", categoryUrl("bags")],
  ["Custom Caps", categoryUrl("caps")],
  ["Custom Jackets", categoryUrl("jackets")],
];