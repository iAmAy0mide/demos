"use client";

import { Command, Moon, Search, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";

export function CommandPalette() {
  const { state, setThemeMode } = useFieldhand();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const openerRef = useRef<HTMLElement | null>(null);
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setIsOpen(true); } if (event.key === "Escape") setIsOpen(false); }; const onOpen = () => setIsOpen(true); window.addEventListener("keydown", onKeyDown); window.addEventListener("fieldhand:open-command", onOpen); return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("fieldhand:open-command", onOpen); }; }, []);
  useEffect(() => { if (!isOpen) openerRef.current?.focus(); }, [isOpen]);
  const openPalette = () => { openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setIsOpen(true); };
  if (!isOpen) return <button type="button" className="flex min-h-9 min-w-44 flex-1 items-center gap-2 rounded-md border border-[var(--fld-line)] px-3 text-left text-sm text-[var(--fld-muted)] hover:border-[var(--fld-signal)]" onClick={openPalette}><Search size={15} />Search jobs, customers, or actions<span className="ml-auto font-mono text-xs">⌘K</span></button>;
  const jobs = state.jobs.filter((job) => job.id.toLowerCase().includes(query.toLowerCase()) || job.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  return createPortal(<div className="fixed inset-0 z-[100] bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={() => setIsOpen(false)}><div className="mx-auto mt-[15vh] w-full max-w-[640px] border border-[var(--fld-line)] bg-[var(--fld-panel)] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><label className="flex items-center gap-2 border border-transparent border-b-[var(--fld-line)] px-4 focus-within:border-[var(--fld-signal)] focus-within:ring-2 focus-within:ring-[var(--fld-signal)]/30"><Search size={16} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="h-14 w-full bg-transparent text-sm outline-none focus-visible:outline-none" placeholder="Jump to a job or action" /></label><div className="max-h-[50vh] overflow-y-auto p-2"><p className="px-3 py-2 text-xs font-medium text-[var(--fld-muted)]">Jobs</p>{jobs.map((job) => <Link key={job.id} href={`/work/fieldhand?job=${job.id}`} onClick={() => setIsOpen(false)} className="flex min-h-10 items-center justify-between px-3 text-sm hover:bg-[var(--fld-hover)]"><span>{job.title}</span><span className="font-mono text-xs text-[var(--fld-muted)]">{job.id}</span></Link>)}<p className="px-3 py-2 text-xs font-medium text-[var(--fld-muted)]">Preferences</p><button className="flex min-h-10 w-full items-center gap-2 px-3 text-sm hover:bg-[var(--fld-hover)]" type="button" onClick={() => { setThemeMode("dark"); setIsOpen(false); }}><Moon size={15} />Use dark theme</button><button className="flex min-h-10 w-full items-center gap-2 px-3 text-sm hover:bg-[var(--fld-hover)]" type="button" onClick={() => { setThemeMode("light"); setIsOpen(false); }}><Sun size={15} />Use light theme</button>{jobs.length === 0 && <p className="p-3 text-sm text-[var(--fld-muted)]">No matching jobs. Try a job ID or service name.</p>}</div><p className="border-t border-[var(--fld-line)] px-4 py-3 font-mono text-[11px] text-[var(--fld-muted)]"><Command className="inline" size={12} />K to open · Esc to close</p></div></div>, document.body);
}
