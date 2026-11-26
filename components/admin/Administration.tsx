"use client";

import { useState } from "react";
import { company } from "@/data/site";
import { permissions, roles, type Role, type Staff } from "@/data/admin";
import { useAdmin } from "./AdminState";
import { AdminHeading, Badge, Confirm, Field, Panel } from "./UI";

export function StaffManagement() {
  const { data, update } = useAdmin();
  const [selected, setSelected] = useState<Role>("Administrator");
  const [message, setMessage] = useState("");
  function patchStaff(id: string, fields: Partial<Staff>) {
    update(current => ({ ...current, staff: current.staff.map(person => person.id === id ? { ...person, ...fields } : person) }));
    setMessage("Demo staff record updated.");
  }
  return <><AdminHeading title="Staff" description="Review fictional staff and proposed roles. The matrix documents a future server-side access model."/>
    <Panel title="Staff directory">
      <div className="ad-table-wrap" role="region" aria-label="Staff directory" tabIndex={0}><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Account status</th><th>Last activity</th></tr></thead>
        <tbody>{data.staff.map(person => <tr key={person.id}><th scope="row">{person.name}</th><td>{person.email}</td><td>
          <select aria-label={"Role for " + person.name} value={person.role} onChange={event => patchStaff(person.id, { role: event.target.value as Role })}>{roles.map(role => <option key={role}>{role}</option>)}</select>
        </td><td><select aria-label={"Status for " + person.name} value={person.status} onChange={event => patchStaff(person.id, { status: event.target.value as Staff["status"] })}><option>Active</option><option>Inactive</option></select></td><td>Demo placeholder</td></tr>)}</tbody>
      </table></div><p role="status">{message}</p>
    </Panel>
    <Panel title="Role-permission matrix">
      <div className="ad-filters"><Field label="Role to edit"><select value={selected} onChange={event => setSelected(event.target.value as Role)}>{roles.map(role => <option key={role}>{role}</option>)}</select></Field></div>
      <div className="ad-table-wrap" tabIndex={0} role="region" aria-label="Role-permission matrix"><table><thead><tr><th>Permission</th>{roles.map(role => <th key={role}>{role}</th>)}</tr></thead><tbody>
        {permissions.map(permission => <tr key={permission}><th scope="row">{permission}</th>{roles.map(role => {
          const checked = data.rolePermissions[role].includes(permission);
          return <td key={role}>{role === selected ? <label className="ad-inline-check"><input type="checkbox" checked={checked} aria-label={permission + " for " + role} onChange={event => {
            const on = event.target.checked;
            update(current => ({ ...current, rolePermissions: { ...current.rolePermissions, [role]: on ? [...current.rolePermissions[role], permission] : current.rolePermissions[role].filter(item => item !== permission) } }));
          }}/>{checked ? "Allowed" : "Unavailable"}</label> : <span>{checked ? "Allowed" : "Unavailable"}</span>}</td>;
        })}</tr>)}
      </tbody></table></div>
    </Panel>
  </>;
}

const settings = [
  { title: "Company & contact", fields: [["company", "Company name draft", company.name], ["email", "Business email draft", company.email], ["phone", "Telephone draft", company.phones[0][0]], ["address", "Business address draft", company.address]] },
  { title: "Orders & printing", fields: [["orderPrefix", "Proposed order prefix", "AR-DEMO"], ["artReview", "Proposed artwork review instructions", "Review placement and colours before sending a proof."]] },
  { title: "Shipping", fields: [["shippingNote", "Shipping policy draft", "Confirm dispatch arrangements before accepting orders."], ["shippingRegion", "Proposed shipping region", "Client confirmation required"]] },
  { title: "Notifications", fields: [["notificationPolicy", "Proposed notification preferences", "Send approval and dispatch updates after customer consent."]] },
  { title: "Payments", fields: [["paymentNote", "Payment policy draft", "Quotation approval required before payment configuration."]] },
  { title: "Security", fields: [["securityNotes", "Proposed security policy", "Server-side access control and audit logging required."]] },
];

export function Settings() {
  const { data, update, reset } = useAdmin();
  const [draft, setDraft] = useState(data.settings);
  const [message, setMessage] = useState("");
  return <><AdminHeading title="Settings" description="Configure draft business preferences and review future integration requirements."/>
    <form className="ad-settings-form" autoComplete="off" onSubmit={event => {
      event.preventDefault(); update(current => ({ ...current, settings: draft })); setMessage("Demo settings saved.");
    }}>
      <div className="ad-grid-two">{settings.map(section => <Panel key={section.title} title={section.title}><div className="ad-form-grid">{section.fields.map(([key, label, fallback]) =>
        <Field label={label} key={key}><input maxLength={260} value={draft[key] ?? fallback} onChange={event => setDraft({ ...draft, [key]: event.target.value })}/></Field>
      )}</div></Panel>)}</div>
      <div className="ad-actions"><button className="ad-button primary">Save demo settings</button><p role="status">{message}</p></div>
    </form>
    <div className="ad-grid-two ad-spaced">
      <Panel title="Future integrations"><ul className="ad-dashboard-list">
        {["Payment gateway", "Email service", "WhatsApp Business", "Shipping provider", "GST and invoicing"].map(name => <li key={name}><strong>{name}</strong><Badge label="Disabled"/></li>)}
      </ul></Panel>
      <Panel title="Demo data"><p>Restore the original fictional records and remove this session’s admin changes and local files.</p>
        <div className="ad-spaced"><Confirm label="Reset Demo Data" title="Reset the admin demo?" detail="This restores the sample records and clears your admin changes for this session." onConfirm={reset}/></div>
      </Panel>
    </div>
  </>;
}