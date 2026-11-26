"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { company } from "@/data/site";

export function ContactActions() {
  const [open, setOpen] = useState(false);
  return (
    <aside className="contact-action" onKeyDown={event => {
      if (event.key === "Escape") setOpen(false);
    }}>
      {open && (
        <div id="whats-info">
          <b>WhatsApp contact</b>
          {company.whatsapp ? (
            <a href={"https://wa.me/" + company.whatsapp}>Open WhatsApp</a>
          ) : (
            <>
              <p>WhatsApp messaging is pending number confirmation.</p>
              <a href={"tel:" + company.phones[1][1]}>Call {company.phones[1][0]}</a>
            </>
          )}
        </div>
      )}
      <button aria-label="WhatsApp contact information" aria-expanded={open} onClick={() => setOpen(!open)}>
        <MessageCircle size={24} />
      </button>
    </aside>
  );
}