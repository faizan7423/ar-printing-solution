import { WishlistButton } from "@/components/account/WishlistButton";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/ui/Editorial";
import { categories, categoryUrl, productUrl, type Product } from "@/data/catalogue";

export function Breadcrumb({ items }: { items: Array<[string, string?]> }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb">
    <Link href="/">Home</Link>
    {items.map(([label, href]) => <span key={label}><span aria-hidden="true">/</span>{href ? <Link href={href}>{label}</Link> : <span aria-current="page">{label}</span>}</span>)}
  </nav>;
}

export function Price() {
  return <strong className="price">Price on Request</strong>;
}

export function ProductCard({ product }: { product: Product }) {
  return <article className="product-card">
    <Link href={productUrl(product)} className="photo product-photo" aria-label={product.name}>
      <Photo id={product.image} alt={"Illustrative " + categories.find(c => c.id === product.category)?.name.toLowerCase()} />
    </Link>
    <WishlistButton productId={product.id} productName={product.name}/>
    <div className="product-card-copy">
      <h3><Link href={productUrl(product)}>{product.name}</Link></h3>
      <p>{product.description}</p>
      <div className="swatch-row" aria-label="Demo colour palette">
        {product.colourChoices.map(colour => <span className="swatch" key={colour.name} title={colour.name} style={{ background: colour.hex }} />)}
      </div>
      <Price />
      <Link className="textlink" href={productUrl(product)}>Customize Now <ArrowUpRight size={16} /></Link>
    </div>
  </article>;
}

export function CategoryGrid() {
  return <div className="category-grid">
    {categories.map(category => <Link href={categoryUrl(category.id)} key={category.id}>
      <div className="photo"><Photo id={category.image} alt={"Illustrative " + category.name.toLowerCase()} /></div>
      <span>{category.name}<ArrowUpRight size={19} /></span>
    </Link>)}
  </div>;
}