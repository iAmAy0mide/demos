"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { demoRoutes, getAdjacentDemo, type DemoRouteId } from "./demoRoutes";

type DemoShellProps = { currentDemo: DemoRouteId; bottomOffset?: string };

export function DemoShell({ currentDemo, bottomOffset }: DemoShellProps) {
  const nextDemo = getAdjacentDemo(currentDemo, 1);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const dismiss = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <aside
      ref={containerRef}
      className="axm-shell"
      style={
        bottomOffset ? ({ "--axm-shell-bottom": bottomOffset } as React.CSSProperties) : undefined
      }
      aria-label="Axmion concept navigation"
    >
      <button
        className="axm-shell-handle"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Axmion
      </button>
      <nav
        className={`axm-shell-panel ${open ? "axm-shell-panel-open" : ""}`}
        aria-label="Browse concept work"
      >
        <Link href="/">← Back to showcase</Link>
        <span>{demoRoutes[currentDemo].name}</span>
        <Link href={nextDemo.path}>Next work →</Link>
        <small>Concept work by Axmion</small>
      </nav>
    </aside>
  );
}
