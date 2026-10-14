"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { useActiveSection } from "@/src/demos/hub/lib/useActiveSection";
import { DemoLink } from "@/src/shared/components/DemoLink";
import { buildContextMessage, buildWhatsAppLink } from "@/src/shared/config/contact";
import { publishedWorks } from "@/src/shared/works";

const navigation = [
  { label: "Work", id: "work" },
  { label: "Services", id: "services" },
  { label: "Process", id: "process" },
  { label: "Contact", id: "contact" },
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
    const body = document.body;
    const toggle = menuButton.current;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
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
    const closeOnDesktop = () => window.innerWidth > 704 && setIsOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);
    dialog.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
      toggle?.focus();
    };
  }, [isOpen]);
  const closeMenu = () => {
    setIsOpen(false);
  };
  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setIsOpen(false);
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
    );
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
        aria-controls="axm-mobile-menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>
      {isOpen && (
        <div id="axm-mobile-menu" className="axm-menu-backdrop">
          <div
            ref={dialog}
            className="axm-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="axm-menu-top">
              <Link href="/" className="axm-brand">
                <Image src="/images/logo-mark-64.png" alt="" width={28} height={28} />
                <span>Axmion</span>
              </Link>
              <button
                className="axm-menu-button"
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
            <div className="axm-menu-scroll">
              <nav className="axm-menu-nav" aria-label="Mobile navigation">
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
              <p className="axm-menu-label">See it working</p>
              <div className="axm-menu-works">
                {publishedWorks.map((work) => (
                  <DemoLink key={work.id} href={work.route}>
                    <span>{work.name}</span>
                    <small>{work.kind}</small>
                  </DemoLink>
                ))}
              </div>
            </div>
            <div className="axm-menu-bottom">
              <a
                className="axm-button"
                href={buildWhatsAppLink(buildContextMessage())}
                target="_blank"
                rel="noopener noreferrer"
              >
                Start a project
              </a>
              <a href="tel:+2348051681996">0805 168 1996</a>
              <span>Lagos, Nigeria</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
