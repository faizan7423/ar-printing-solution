import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Photo, SectionHeading } from "@/components/ui/Editorial";
import { QuoteButton } from "@/components/forms/QuoteModal";
import { featured } from "@/data/catalogue";
import { CategoryGrid, ProductCard } from "./ShopShared";

export function HomeShop() {
  return <>
    <section className="section container home-shop">
      <div className="section-top"><SectionHeading label="CUSTOM APPAREL" title="Shop by category." /><Link className="textlink" href="/shop">Explore the demo catalogue <ArrowUpRight size={17} /></Link></div>
      <CategoryGrid />
    </section>
    <section className="pale"><div className="container shop-promo two">
      <div className="photo"><Photo id="tees" alt="Illustrative printed T-shirt" /></div>
      <div><SectionHeading label="DESIGN STUDIO" title="Customize your own T-shirt." />
        <p>Add a line of text, your artwork or a company logo. Preview both sides and save the design to your demo cart.</p>
        <Link className="button" href="/customize/t-shirt">Start Customizing <ArrowUpRight size={17}/></Link>
      </div>
    </div></section>
    <section className="section container home-shop">
      <div className="section-top"><SectionHeading label="DEMONSTRATION CATALOGUE" title="Featured products." /><Link className="textlink" href="/shop">Shop all products <ArrowUpRight size={17} /></Link></div>
      <div className="product-grid featured-grid">{featured.map(product => <ProductCard key={product.id} product={product} />)}</div>
    </section>
  </>;
}

export function BulkPrinting() {
  return <section className="dark" id="bulk-orders"><div className="container section split">
    <div><SectionHeading label="FOR BUSINESSES" title="Bulk printing solutions." />
      <p>Tell us about your artwork, garments and quantity. Explore heat transfers, screen printing and specialised textile finishes.</p>
    </div>
    <div className="buttons"><QuoteButton>Request a Bulk Quote</QuoteButton><Link className="ghost" href="/services">Printing Services <ArrowUpRight size={17} /></Link></div>
  </div></section>;
}