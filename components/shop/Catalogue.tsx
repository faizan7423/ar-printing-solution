"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { categories, products } from "@/data/catalogue";
import { ProductCard } from "./ShopShared";

export function Catalogue({ teesOnly = false }: { teesOnly?: boolean }) {
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const query = params.get("q") ?? "";
  return <Results key={category + ":" + query} initialCategory={category} initialQuery={query} teesOnly={teesOnly} />;
}

function Results({ initialCategory, initialQuery, teesOnly }: { initialCategory: string; initialQuery: string; teesOnly: boolean }) {
  const [category, setCategory] = useState(categories.some(item => item.id === initialCategory) ? initialCategory : "");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("featured");
  const term = query.trim().toLowerCase();
  const results = products.filter(product => {
    const categoryName = categories.find(item => item.id === product.category)?.name;
    return (!(teesOnly || category) || product.category === (teesOnly ? "t-shirts" : category)) &&
      (product.name + " " + product.description + " " + categoryName).toLowerCase().includes(term);
  });
  if (sort !== "featured") results.sort((a, b) => a.name.localeCompare(b.name) * (sort === "az" ? 1 : -1));
  function clear() { setCategory(""); setQuery(""); setSort("featured"); }

  return <>
    <div className="catalogue-controls">
      {!teesOnly && <div className="filter-tabs" aria-label="Filter by category">
        {[{ id: "", name: "All products" }, ...categories].map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.name}</button>)}
      </div>}
      <div className="filter-fields">
        <label>Search products<span className="search-field"><Search size={18} /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search styles, bags, caps…" /></span></label>
        <label>Sort by<select value={sort} onChange={event => setSort(event.target.value)}>
          <option value="featured">Featured</option><option value="az">Name A–Z</option><option value="za">Name Z–A</option>
        </select></label>
        <button type="button" className="textlink" onClick={clear}>Clear filters</button>
      </div>
    </div>
    <p className="result-count" role="status">{results.length} {results.length === 1 ? "product" : "products"}</p>
    {results.length ? <div className="product-grid">{results.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-shop"><h2>No products match</h2><p>Try a different search or reset your filters.</p><button className="button" onClick={clear}>Reset filters</button></div>}
  </>;
}