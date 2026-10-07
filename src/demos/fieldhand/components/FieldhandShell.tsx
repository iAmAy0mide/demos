"use client";

import { CalendarDays, ClipboardList, Command, LayoutPanelLeft, PanelLeftClose, PanelLeftOpen, RotateCcw, SunMoon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { CommandPalette } from "@/src/demos/fieldhand/components/CommandPalette";
import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { JobDrawer } from "@/src/demos/fieldhand/components/JobDrawer";
import { ShortcutOverlay } from "@/src/demos/fieldhand/components/ShortcutOverlay";
import { ToastStack } from "@/src/demos/fieldhand/components/ToastStack";
import type { ResolvedTheme } from "@/src/demos/fieldhand/types";

type FieldhandShellProps = Readonly<{ children: React.ReactNode }>;
const LIVE_UPDATE_INTERVAL_MS = 30000;
const navigationItems = [{ href: "/work/fieldhand", label: "Board", icon: LayoutPanelLeft }, { href: "/work/fieldhand/schedule", label: "Schedule", icon: CalendarDays }, { href: "/work/fieldhand/quotes", label: "Quotes", icon: ClipboardList }];

function getResolvedTheme(themeMode: "system" | ResolvedTheme): ResolvedTheme { return themeMode === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : themeMode; }
function FieldhandMark() { return <svg className="size-6 shrink-0 text-[var(--fld-signal)]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4v16M8 7h9l3 5-3 5H8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 12h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>; }

export function FieldhandShell({ children }: FieldhandShellProps) {
  const { state, setThemeMode, resetDemo, simulateLiveUpdate } = useFieldhand();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const liveUpdateRef = useRef(simulateLiveUpdate);
  const pathname = usePathname();
  useEffect(() => { liveUpdateRef.current = simulateLiveUpdate; }, [simulateLiveUpdate]);
  useEffect(() => { document.documentElement.dataset.fieldhandTheme = getResolvedTheme(state.themeMode); }, [state.themeMode]);
  useEffect(() => { const media = window.matchMedia("(max-width: 1359px)"); const sync = () => setIsSidebarCollapsed(media.matches); sync(); media.addEventListener("change", sync); return () => media.removeEventListener("change", sync); }, []);
  useEffect(() => { if (!state.isLoaded) return; const timer = window.setInterval(() => liveUpdateRef.current(), LIVE_UPDATE_INTERVAL_MS); return () => window.clearInterval(timer); }, [state.isLoaded]);

  return <div className="h-dvh overflow-hidden bg-[var(--fld-canvas)] text-[var(--fld-text)] max-[560px]:h-auto max-[560px]:min-h-dvh max-[560px]:overflow-auto"><div className="grid h-dvh min-h-0 grid-cols-[auto_minmax(0,1fr)] max-[560px]:h-auto max-[560px]:min-h-dvh">
    <aside className={`sticky top-0 h-dvh self-start overflow-y-auto border-r border-[var(--fld-line)] bg-[var(--fld-panel)] p-2 transition-[width] duration-150 max-[560px]:h-auto ${isSidebarCollapsed ? "w-16" : "w-56"}`}><div className="flex h-12 items-center justify-between gap-2 px-2">{isSidebarCollapsed ? <FieldhandMark /> : <div className="min-w-0"><div className="flex items-center gap-2 font-semibold tracking-[-.04em]"><FieldhandMark /><span>Fieldhand</span></div><p className="mt-0.5 truncate pl-8 text-[11px] text-[var(--fld-muted)]">Voltline Services</p></div>}<button aria-label="Toggle sidebar" className="grid size-9 place-items-center rounded-md text-[var(--fld-muted)] hover:bg-[var(--fld-hover)] hover:text-[var(--fld-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fld-signal)]" onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}>{isSidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button></div><nav className="mt-5 space-y-1" aria-label="Fieldhand navigation">{navigationItems.map(({ href, label, icon: Icon }) => { const isActive = pathname === href; return <Link key={href} href={href} className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm ${isActive ? "bg-[var(--fld-selected)] text-[var(--fld-signal)]" : "text-[var(--fld-muted)] hover:bg-[var(--fld-hover)] hover:text-[var(--fld-text)]"}`}><Icon size={17} aria-hidden="true" />{!isSidebarCollapsed && label}</Link>; })}</nav></aside>
    <div className="grid min-h-0 min-w-0 grid-rows-[3.5rem_minmax(0,1fr)] max-[560px]:h-auto max-[560px]:min-h-dvh"><header className="flex items-center gap-3 border-b border-[var(--fld-line)] bg-[var(--fld-canvas)] px-4"><CommandPalette /><button aria-label="Toggle color theme" className="grid size-10 place-items-center rounded-md border border-[var(--fld-line)] text-[var(--fld-muted)] hover:text-[var(--fld-text)]" onClick={() => setThemeMode(state.themeMode === "dark" ? "light" : "dark")} type="button"><SunMoon size={16} /></button><button aria-label="Reset demo" className="grid size-10 place-items-center rounded-md border border-[var(--fld-line)] text-[var(--fld-muted)] hover:text-[var(--fld-text)]" onClick={resetDemo} type="button"><RotateCcw size={16} /></button><button aria-label="Open command palette" className="grid size-10 place-items-center rounded-md bg-[var(--fld-signal)] text-white hover:brightness-110" type="button" onClick={() => window.dispatchEvent(new Event("fieldhand:open-command"))}><Command size={17} /></button></header><div className="min-h-0 max-[560px]:min-h-[calc(100dvh-3.5rem)]">{children}</div><Suspense fallback={null}><JobDrawer /></Suspense><ToastStack /><ShortcutOverlay /></div>
  </div></div>;
}
