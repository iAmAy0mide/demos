"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { buildContextMessage, buildWhatsAppLink } from "@/src/shared/config/contact";

const navigation = ["Work"];

export function HubHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if (event.key !== "Tab" || !dialog.current) {
        return;
      }
      const focusable = dialog.current.querySelectorAll<HTMLElement>("a, button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    dialog.current?.querySelector<HTMLElement>("a")?.focus();
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);
  const closeMenu = () => {
    setIsOpen(false);
    menuButton.current?.focus();
  };
  return (
    <header className="axm-header">
      <Link href="/" className="axm-brand" aria-label="Axmion home">
        <Image src="/images/logo-mark-64.png" alt="Axmion logo" width={28} height={28} priority />
        <span>Axmion</span>
      </Link>
      <nav className="axm-nav" aria-label="Primary navigation">
        {navigation.map((label) => (
          <a key={label} href={`#${label.toLowerCase()}`}>
            {label}
          </a>
        ))}
      </nav>
      <a
        className="axm-project-link"
        href={buildWhatsAppLink(buildContextMessage())}
        target="_blank"
        rel="noopener noreferrer"
      >
        Start a project
      </a>
      <button
        ref={menuButton}
        className="axm-menu-button"
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <span />
        <span />
      </button>
      {isOpen && (
        <div className="axm-menu-backdrop" onMouseDown={closeMenu}>
          <div
            ref={dialog}
            className="axm-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {navigation.map((label) => (
              <a key={label} href={`#${label.toLowerCase()}`} onClick={closeMenu}>
                {label}
              </a>
            ))}
            <a
              href={buildWhatsAppLink(buildContextMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              Start a project
            </a>
            <button type="button" onClick={closeMenu}>
              Close menu
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
