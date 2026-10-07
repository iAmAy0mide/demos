"use client";

import { Command, LayoutPanelLeft, Moon, Plus, ReceiptText, RotateCcw, Search, Sun, Type } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";

type PaletteGroup = "Navigate" | "Actions" | "Preferences";
type PaletteItem = { id: string; group: PaletteGroup; label: string; icon: typeof Search; run: () => void };

function highlightText(value: string, query: string) {
  if (!query) return value;
  const index = value.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return value;
  return <>{value.slice(0, index)}<mark className="bg-[var(--fld-selected)] text-inherit">{value.slice(index, index + query.length)}</mark>{value.slice(index + query.length)}</>;
}

export function CommandPalette() {
  const { state, setThemeMode, resetDemo } = useFieldhand();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMac, setIsMac] = useState(false);
  const router = useRouter();
  const openerRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const shortcut = isMac ? "⌘K" : "Ctrl K";
  const close = () => setIsOpen(false);
  const open = () => { openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setQuery(""); setIsOpen(true); };

  useEffect(() => {
    const platformFrame = window.requestAnimationFrame(() => setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform)));
    const onKeyDown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); open(); } if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKeyDown); window.addEventListener("fieldhand:open-command", open);
    return () => { window.cancelAnimationFrame(platformFrame); window.removeEventListener("keydown", onKeyDown); window.removeEventListener("fieldhand:open-command", open); };
  }, []);
  useEffect(() => { if (isOpen) { window.setTimeout(() => inputRef.current?.focus(), 0); return; } openerRef.current?.focus(); }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button, a, input, [tabindex]:not([tabindex='-1'])");
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", trapFocus); return () => window.removeEventListener("keydown", trapFocus);
  }, [isOpen]);

  const items = useMemo<PaletteItem[]>(() => [
    { id: "board", group: "Navigate", label: "Go to Board", icon: LayoutPanelLeft, run: () => router.push("/work/fieldhand") },
    { id: "schedule", group: "Navigate", label: "Go to Schedule", icon: LayoutPanelLeft, run: () => router.push("/work/fieldhand/schedule") },
    { id: "quotes", group: "Navigate", label: "Go to Quotes", icon: ReceiptText, run: () => router.push("/work/fieldhand/quotes") },
    { id: "create", group: "Actions", label: "Create job", icon: Plus, run: () => window.dispatchEvent(new Event("fieldhand:create-job")) },
    { id: "shortcuts", group: "Actions", label: "Show shortcuts", icon: Type, run: () => window.dispatchEvent(new Event("fieldhand:show-shortcuts")) },
    { id: "reset", group: "Actions", label: "Reset demo", icon: RotateCcw, run: resetDemo },
    { id: "dark", group: "Preferences", label: "Use dark theme", icon: Moon, run: () => setThemeMode("dark") },
    { id: "light", group: "Preferences", label: "Use light theme", icon: Sun, run: () => setThemeMode("light") },
  ], [resetDemo, router, setThemeMode]);
  const search = query.toLowerCase();
  const jobs = state.jobs.filter((job) => `${job.id} ${job.title}`.toLowerCase().includes(search)).slice(0, 4);
  const matchingItems = items.filter((item) => item.label.toLowerCase().includes(search));
  const groups = ["Jobs", "Navigate", "Actions", "Preferences"] as const;

  return <>
    <button type="button" className="flex min-h-10 min-w-44 flex-1 items-center gap-2 rounded-md border border-[var(--fld-line)] px-3 text-left text-sm text-[var(--fld-muted)] hover:border-[var(--fld-signal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fld-signal)]/40" onClick={open}><Search size={15} />Search jobs, customers, or actions<span className="ml-auto font-mono text-xs">{shortcut}</span></button>
    {isOpen && createPortal(<div className="fixed inset-0 z-[100] bg-black/55 p-4" role="presentation" onMouseDown={close}><div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Command palette" className="mx-auto mt-[15vh] w-full max-w-[640px] overflow-hidden rounded-lg border border-[var(--fld-line)] bg-[var(--fld-panel)] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
      <label className="flex items-center gap-2 border-b border-[var(--fld-line)] px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[var(--fld-signal)]"><Search size={16} aria-hidden="true" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} className="h-14 w-full bg-transparent text-sm outline-none" placeholder="Jump to a job or action" /></label>
      <div className="max-h-[50vh] overflow-y-auto p-2">{groups.map((group) => { const groupJobs = group === "Jobs" ? jobs : []; const groupItems = group === "Jobs" ? [] : matchingItems.filter((item) => item.group === group); if (!groupJobs.length && !groupItems.length) return null; return <section key={group} className="mb-2 last:mb-0"><h2 className="px-3 py-2 text-xs font-medium text-[var(--fld-muted)]">{group}</h2>{groupJobs.map((job) => <Link key={job.id} href={`/work/fieldhand?job=${job.id}`} onClick={close} className="flex min-h-10 items-center justify-between rounded px-3 text-sm hover:bg-[var(--fld-hover)]"><span>{highlightText(job.title, query)}</span><span className="font-mono text-xs text-[var(--fld-muted)]">{highlightText(job.id, query)}</span></Link>)}{groupItems.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" className="flex min-h-10 w-full items-center gap-2 rounded px-3 text-left text-sm hover:bg-[var(--fld-hover)]" onClick={() => { item.run(); close(); }}><Icon size={15} aria-hidden="true" />{highlightText(item.label, query)}</button>; })}</section>; })}{!jobs.length && !matchingItems.length && <p className="p-4 text-sm text-[var(--fld-muted)]">No commands or jobs match “{query}”.</p>}</div>
      <p className="border-t border-[var(--fld-line)] px-4 py-3 font-mono text-[11px] text-[var(--fld-muted)]"><Command className="inline" size={12} /> {shortcut} to open · Esc to close</p>
    </div></div>, document.body)}
  </>;
}
