"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { formatMoney, productStates } from "@/data/admin";
import { useAdmin } from "./AdminState";
import { AdminHeading, Badge, Confirm, Empty, Field, Filter, LocalImage, Panel } from "./UI";

export function Products() {
  const { data, update, saveProduct } = useAdmin();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("name");
  const items = data.products.filter(product => (!category || category === product.categoryId) && (!status || status === product.status) &&
    (product.name + " " + product.sku).toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === "price" ? a.price - b.price : sort === "sku" ? a.sku.localeCompare(b.sku) : a.name.localeCompare(b.name));
  return <><AdminHeading title="Products" description="Manage the draft catalogue, variant definitions and demo base prices."
    actions={<Link className="ad-button primary" href="/admin/products/new"><Plus size={17}/> Add Product</Link>}/>
    <Panel title="Product register">
      <div className="ad-filters"><Field label="Search products"><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Product name or SKU"/></Field>
        <Field label="Category"><select value={category} onChange={event => setCategory(event.target.value)}><option value="">All</option>{data.categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Filter label="Product status" value={status} options={productStates} onChange={setStatus}/>
        <Field label="Sort by"><select value={sort} onChange={event => setSort(event.target.value)}><option value="name">Name A–Z</option><option value="price">Base price</option><option value="sku">SKU</option></select></Field>
      </div>
      {items.length ? <div className="ad-table-wrap" role="region" aria-label="Product register" tabIndex={0}><table><thead><tr>
        <th>Product</th><th>SKU</th><th>Category</th><th>Status</th><th>Demo base price</th><th>Variants</th><th>Available</th><th>Actions</th>
      </tr></thead><tbody>{items.map(product => {
        const variants = data.variants.filter(variant => variant.productId === product.id && variant.active);
        return <tr key={product.id}><th scope="row"><div className="ad-record-label"><div className="ad-record-img"><LocalImage file={product.files[0]} fallback={"/images/" + product.image + ".webp"}/></div>{product.name}</div></th>
          <td>{product.sku}</td><td>{data.categories.find(item => item.id === product.categoryId)?.name}</td><td><Badge label={product.status}/></td>
          <td>{formatMoney(product.price)}</td><td>{variants.length}</td><td>{variants.reduce((sum, variant) => sum + variant.available, 0)}</td>
          <td><div className="ad-actions"><Link className="ad-button secondary" href={"/admin/products/" + product.id + "/edit"}>Edit</Link>
            <button className="ad-button secondary" type="button" onClick={() => {
              let suffix = 1;
              while (data.products.some(item => item.sku.toUpperCase() === (product.sku + "-COPY-" + suffix).toUpperCase())) suffix++;
              const id = saveProduct({ ...product, id: "", status: "Draft", openingStock: 0, name: product.name + " (copy)", sku: product.sku + "-COPY-" + suffix });
              router.push("/admin/products/" + id + "/edit");
            }}>Duplicate</button>
            {product.status !== "Archived" && <Confirm label="Archive" title="Archive this demo product?" detail="This marks the draft product as archived and preserves its order history and inventory records."
              onConfirm={() => update(current => ({ ...current, products: current.products.map(item => item.id === product.id ? { ...item, status: "Archived" } : item) }))}/>}
          </div></td>
        </tr>;
      })}</tbody></table></div> : <Empty title="No products match"/>}
    </Panel>
  </>;
}