"use client";

import { Keyboard, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const shortcuts = [["Open command palette", "K"], ["Create job", "N"], ["Close overlay", "Esc"]];

export function ShortcutOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  useEffect(() => { const platformFrame = window.requestAnimationFrame(() => setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform))); const show = () => setIsOpen(true); const onKey = (event: KeyboardEvent) => { if (event.key === "?" && !event.metaKey && !event.ctrlKey) setIsOpen(true); if (event.key === "Escape") setIsOpen(false); }; window.addEventListener("fieldhand:show-shortcuts", show); window.addEventListener("keydown", onKey); return () => { window.cancelAnimationFrame(platformFrame); window.removeEventListener("fieldhand:show-shortcuts", show); window.removeEventListener("keydown", onKey); }; }, []);
  if (!isOpen) return null;
  return createPortal(<div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4" role="presentation" onMouseDown={() => setIsOpen(false)}><section role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" className="w-full max-w-sm border border-[var(--fld-line)] bg-[var(--fld-panel)] p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><Keyboard size={18} />Keyboard shortcuts</h2><button className="grid size-9 place-items-center hover:bg-[var(--fld-hover)]" type="button" onClick={() => setIsOpen(false)} aria-label="Close shortcuts"><X size={17} /></button></div><dl className="mt-5 space-y-3 text-sm">{shortcuts.map(([label, key]) => <div className="flex items-center justify-between" key={label}><dt>{label}</dt><dd className="font-mono text-xs text-[var(--fld-muted)]">{key === "K" ? `${isMac ? "⌘" : "Ctrl "}${key}` : key}</dd></div>)}</dl></section></div>, document.body);
}
