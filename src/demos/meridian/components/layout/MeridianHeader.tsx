"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const links = [{ href: "/work/meridian/services", label: "Services" }, { href: "/work/meridian/track", label: "Track" }, { href: "/work/meridian/about", label: "About" }, { href: "/work/meridian/contact", label: "Contact" }];

export function MeridianHeader() {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = opener.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    const closeOnKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !panel.current) return;
      const targets = [...panel.current.querySelectorAll<HTMLElement>("a,button")];
      const first = targets[0];
      const last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", closeOnKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", closeOnKey); trigger?.focus(); };
  }, [open]);

  return <header className="mrd-header"><Link className="mrd-logo" href="/work/meridian"><span>MERIDIAN</span><small>FREIGHT / LAGOS</small></Link><nav aria-label="Primary">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav><Link className="mrd-quote-link" href="/work/meridian/quote">Get a quote</Link><button ref={opener} className="mrd-menu-button" aria-expanded={open} aria-controls="mrd-menu" onClick={() => setOpen(true)}><Menu aria-hidden="true"/><span className="sr-only">Open menu</span></button>{open && <div className="mrd-menu-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><div ref={panel} id="mrd-menu" className="mrd-mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation"><button className="mrd-close" onClick={() => setOpen(false)}><X aria-hidden="true"/><span className="sr-only">Close menu</span></button>{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}<Link href="/work/meridian/quote" onClick={() => setOpen(false)}>Get a quote</Link></div></div>}</header>;
}
