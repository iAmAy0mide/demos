"use client";

import { CalendarDays, ClipboardList, Command, LayoutPanelLeft, PanelLeftClose, PanelLeftOpen, RotateCcw, SunMoon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { JobDrawer } from "@/src/demos/fieldhand/components/JobDrawer";
import { CommandPalette } from "@/src/demos/fieldhand/components/CommandPalette";
import type { ResolvedTheme } from "@/src/demos/fieldhand/types";

type FieldhandShellProps = Readonly<{ children: React.ReactNode }>;

const navigationItems = [
  { href: "/work/fieldhand", label: "Board", icon: LayoutPanelLeft },
  { href: "/work/fieldhand/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/work/fieldhand/quotes", label: "Quotes", icon: ClipboardList },
];

function getResolvedTheme(themeMode: "system" | ResolvedTheme): ResolvedTheme {
  if (themeMode !== "system") return themeMode;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function FieldhandShell({ children }: FieldhandShellProps) {
  const { state, setThemeMode, resetDemo, simulateLiveUpdate } = useFieldhand();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dataset.fieldhandTheme = getResolvedTheme(state.themeMode);
  }, [state.themeMode]);

  useEffect(() => { if (!state.isLoaded) return; const timer = window.setTimeout(simulateLiveUpdate, 9000); return () => window.clearTimeout(timer); }, [simulateLiveUpdate, state.isLoaded]);

  return (
    <div className="min-h-dvh bg-[var(--fld-canvas)] text-[var(--fld-text)]">
      <div className="grid min-h-dvh grid-cols-[auto_1fr]">
        <aside className={`border-r border-[var(--fld-line)] bg-[var(--fld-panel)] p-2 ${isSidebarCollapsed ? "w-16" : "w-56"}`}>
          <div className="flex h-10 items-center justify-between px-2 font-semibold tracking-[-0.03em]">
            {!isSidebarCollapsed && <span>Voltline</span>}
            <button aria-label="Toggle sidebar" className="grid size-9 place-items-center rounded-md text-[var(--fld-muted)] hover:bg-[var(--fld-hover)] hover:text-[var(--fld-text)]" onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}>
              {isSidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </button>
          </div>
          <nav className="mt-5 space-y-1" aria-label="Fieldhand navigation">
            {navigationItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return <Link key={href} href={href} className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-sm ${isActive ? "bg-[var(--fld-selected)] text-[var(--fld-signal)]" : "text-[var(--fld-muted)] hover:bg-[var(--fld-hover)] hover:text-[var(--fld-text)]"}`}><Icon size={17} aria-hidden="true" />{!isSidebarCollapsed && label}</Link>;
            })}
          </nav>
        </aside>
        <div className="min-w-0">
          <header className="flex h-14 items-center gap-3 border-b border-[var(--fld-line)] bg-[var(--fld-canvas)] px-4">
            <CommandPalette />
            <button aria-label="Toggle color theme" className="grid size-10 place-items-center rounded-md border border-[var(--fld-line)] text-[var(--fld-muted)] hover:text-[var(--fld-text)]" onClick={() => setThemeMode(state.themeMode === "dark" ? "light" : "dark")} type="button"><SunMoon size={16} /></button>
            <button aria-label="Reset demo" className="grid size-10 place-items-center rounded-md border border-[var(--fld-line)] text-[var(--fld-muted)] hover:text-[var(--fld-text)]" onClick={resetDemo} type="button"><RotateCcw size={16} /></button>
            <button aria-label="Open command palette" className="grid size-10 place-items-center rounded-md bg-[var(--fld-signal)] text-white hover:brightness-110" type="button"><Command size={17} /></button>
          </header>
          {children}
          <Suspense fallback={null}><JobDrawer /></Suspense>
          {state.toast && <p className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 border border-[var(--fld-line)] bg-[var(--fld-panel)] px-4 py-3 text-sm shadow-xl" aria-live="polite">{state.toast}</p>}
        </div>
      </div>
    </div>
  );
}
