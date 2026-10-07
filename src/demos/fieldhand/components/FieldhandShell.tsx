"use client";

import { CalendarDays, ClipboardList, Command, LayoutPanelLeft, PanelLeftClose, PanelLeftOpen, Search, SunMoon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
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
  const { state, setThemeMode } = useFieldhand();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dataset.fieldhandTheme = getResolvedTheme(state.themeMode);
  }, [state.themeMode]);

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
            <button className="flex min-h-9 min-w-44 flex-1 items-center gap-2 rounded-md border border-[var(--fld-line)] px-3 text-left text-sm text-[var(--fld-muted)] hover:border-[var(--fld-signal)]" type="button"><Search size={15} aria-hidden="true" />Search jobs, customers, or actions<span className="ml-auto font-mono text-xs">⌘K</span></button>
            <button aria-label="Toggle color theme" className="grid size-10 place-items-center rounded-md border border-[var(--fld-line)] text-[var(--fld-muted)] hover:text-[var(--fld-text)]" onClick={() => setThemeMode(state.themeMode === "dark" ? "light" : "dark")} type="button"><SunMoon size={16} /></button>
            <button aria-label="Open command palette" className="grid size-10 place-items-center rounded-md bg-[var(--fld-signal)] text-white hover:brightness-110" type="button"><Command size={17} /></button>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
