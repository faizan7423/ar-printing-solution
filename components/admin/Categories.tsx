"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { type CategoryRecord } from "@/data/admin";
import { useAdmin } from "./AdminState";
import { AdminHeading, Badge, Confirm, Field, Modal, Panel } from "./UI";

export function Categories() {
  const { data, update } = useAdmin();
  const [editing, setEditing] = useState<CategoryRecord>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  function open(category: CategoryRecord) { setEditing(category); setError(""); }
  function reorder(id: string, direction: number) {
    update(current => {
      const categories = [...current.categories];
      const index = categories.findIndex(item => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= categories.length) return current;
      [categories[index], categories[target]] = [categories[target], categories[index]];
      return { ...current, categories };
    });
  }
  return <><AdminHeading title="Categories" description="Organize the catalogue’s demo taxonomy and visibility."
    actions={<button type="button" className="ad-button primary" onClick={() => open({ id: "", name: "", description: "", visibility: "Visible" })}>Add Category</button>}/>
    <Panel title="Category order">
      <p role="status">{message}</p>
      <div className="ad-table-wrap" tabIndex={0} role="region" aria-label="Category order"><table><thead><tr><th>Order</th><th>Category</th><th>Description</th><th>Products</th><th>Visibility</th><th>Actions</th></tr></thead>
        <tbody>{data.categories.map((category, index) => {
          const count = data.products.filter(item => item.categoryId === category.id).length;
          return <tr key={category.id}><td>{index + 1}</td><th scope="row">{category.name}</th><td>{category.description}</td><td>{count}</td><td><Badge label={category.visibility}/></td>
            <td><div className="ad-actions">
              <button type="button" className="ad-button secondary" disabled={index === 0} aria-label={"Move " + category.name + " up"} onClick={() => reorder(category.id, -1)}><ArrowUp size={14}/></button>
              <button type="button" className="ad-button secondary" disabled={index === data.categories.length - 1} aria-label={"Move " + category.name + " down"} onClick={() => reorder(category.id, 1)}><ArrowDown size={14}/></button>
              <button type="button" className="ad-button secondary" onClick={() => open(category)}>Edit</button>
              {category.visibility !== "Archived" && (count ? <span className="ad-muted">In use</span> :
                <Confirm label="Archive" title="Archive this unused category?" detail="The category will remain in the demo register as archived." onConfirm={() => update(current => ({
                  ...current, categories: current.products.some(product => product.categoryId === category.id) ? current.categories :
                    current.categories.map(item => item.id === category.id ? { ...item, visibility: "Archived" } : item),
                }))}/>)}
            </div></td>
          </tr>;
        })}</tbody>
      </table></div>
    </Panel>
    {editing && <Modal title={editing.id ? "Edit category" : "New category"} close={() => setEditing(undefined)}>
      <form className="ad-form" onSubmit={event => {
        event.preventDefault();
        const name = event.currentTarget.querySelector("input")?.value.trim() ?? "";
        const description = event.currentTarget.querySelector("textarea")?.value.trim() ?? "";
        const visibility = event.currentTarget.querySelector("select")?.value as CategoryRecord["visibility"];
        if (!name || data.categories.some(item => item.id !== editing.id && item.name.toLowerCase() === name.toLowerCase())) { setError("Use a unique category name."); return; }
        const item = { id: editing.id || "cat-" + crypto.randomUUID(), name, description, visibility };
        update(current => ({ ...current, categories: editing.id ? current.categories.map(category => category.id === editing.id ? item : category) : [...current.categories, item] }));
        setEditing(undefined); setMessage("Category saved.");
      }}>
        <Field label="Category name"><input required pattern=".*\S.*" maxLength={60} defaultValue={editing.name} autoFocus/></Field>
        <Field label="Visibility"><select defaultValue={editing.visibility === "Archived" ? "Hidden" : editing.visibility}><option>Visible</option><option>Hidden</option></select></Field>
        <label className="wide">Description<textarea rows={2} maxLength={160} defaultValue={editing.description}/></label>
        <p className="form-error wide" role="alert">{error}</p><button className="ad-button primary">Save Category</button>
      </form>
    </Modal>}
  </>;
}