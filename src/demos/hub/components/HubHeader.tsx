"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { useActiveSection } from "@/src/demos/hub/lib/useActiveSection";
import { buildContextMessage, buildWhatsAppLink } from "@/src/shared/config/contact";

const navigation = [
  { label: "Work", id: "work" },
  { label: "Services", id: "services" },
  { label: "Process", id: "process" },
];
const navigationIds = navigation.map((item) => item.id);

export function HubHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const activeSection = useActiveSection(navigationIds);
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
  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };
  return (
    <header className="axm-header">
      <Link href="/" className="axm-brand" aria-label="Axmion home">
        <Image src="/images/logo-mark-64.png" alt="Axmion logo" width={28} height={28} priority />
        <span>Axmion</span>
      </Link>
      <nav className="axm-nav" aria-label="Primary navigation">
        {navigation.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={activeSection === item.id ? "true" : undefined}
            onClick={(event) => scrollToSection(event, item.id)}
          >
            {item.label}
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
            {navigation.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? "true" : undefined}
                onClick={(event) => {
                  scrollToSection(event, item.id);
                  closeMenu();
                }}
              >
                {item.label}
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
