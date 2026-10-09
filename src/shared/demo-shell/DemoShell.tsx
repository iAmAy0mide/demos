"use client";

import { ChevronUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AxmionAttribution } from "@/src/shared/components/AxmionAttribution";
import { useIsEmbedded } from "@/src/shared/lib/useIsEmbedded";
import { publishedWorks } from "@/src/shared/works";

import { getCurrentWork, getNextWork, getWorkPosition, type DemoRouteId } from "./demoRoutes";

type DemoShellProps = { currentDemo: DemoRouteId; bottomOffset?: string };

export function DemoShell({ currentDemo, bottomOffset }: DemoShellProps) {
  const isEmbedded = useIsEmbedded();
  const currentWork = getCurrentWork(currentDemo);
  const nextWork = getNextWork(currentDemo);
  const position = getWorkPosition(currentDemo);
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

  if (isEmbedded) {
    return null;
  }

  return (
    <aside
      ref={containerRef}
      className="axm-shell"
      style={
        bottomOffset
          ? ({ "--axm-shell-offset-bottom": bottomOffset } as React.CSSProperties)
          : undefined
      }
      aria-label="Axmion concept navigation"
    >
      <button
        className="axm-shell-handle"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Image
          className="axm-shell-mark"
          src="/images/logo-mark-128.png"
          alt=""
          width={20}
          height={20}
        />
        <span>Axmion</span>
        <ChevronUp className="axm-shell-chevron" size={14} aria-hidden="true" />
      </button>
      <nav
        className={`axm-shell-panel ${open ? "axm-shell-panel-open" : ""}`}
        aria-label="Browse concept work"
      >
        <Link href="/">Showcase</Link>
        <span>
          {currentWork.name} · {position} / {publishedWorks.length}
        </span>
        <Link href={nextWork.route}>Next</Link>
        <AxmionAttribution demoName={currentWork.name} variant="line" />
      </nav>
    </aside>
  );
}
