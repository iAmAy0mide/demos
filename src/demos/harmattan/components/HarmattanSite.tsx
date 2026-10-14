"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { HarmattanFooter } from "./HarmattanFooter";
import { harmattanLinks, HarmattanHeader } from "./HarmattanHeader";
import { getCoffee } from "../data/coffees";
import { naira } from "../lib/pricing";
import { BagProvider, useBag } from "../lib/useBag";

export function HarmattanSite({ children }: { children: React.ReactNode }) {
  return (
    <BagProvider>
      <HarmattanSiteContent>{children}</HarmattanSiteContent>
    </BagProvider>
  );
}

function HarmattanSiteContent({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const { items, itemCount, notice, remove } = useBag();
  const menuButton = useRef<HTMLButtonElement>(null);
  const bagButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setBagOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const closeMenu = () => {
    setMenuOpen(false);
    menuButton.current?.focus();
  };
  const closeBag = () => {
    setBagOpen(false);
    bagButton.current?.focus();
  };
  return (
    <>
      <a className="hrm-skip" href="#main">
        Skip to content
      </a>
      <HarmattanHeader
        itemCount={itemCount}
        bagButton={bagButton}
        menuButton={menuButton}
        onOpenBag={() => setBagOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
      />
      {children}
      <HarmattanFooter />
      {notice && (
        <div className="hrm-bag-notice" role="status">
          {notice}
        </div>
      )}
      {menuOpen && (
        <Layer title="Menu" close={closeMenu}>
          <nav className="hrm-drawer-links">
            {harmattanLinks.map(([label, href]) => (
              <Link onClick={closeMenu} key={href} href={href}>
                {label}
              </Link>
            ))}
            <Link onClick={closeMenu} className="hrm-button" href="/work/harmattan/subscribe">
              Start a subscription
            </Link>
          </nav>
        </Layer>
      )}
      {bagOpen && (
        <Layer title="Your bag" close={closeBag}>
          {items.length === 0 ? (
            <p>Your bag is waiting for a coffee with a story.</p>
          ) : (
            <>
              {items.map((item) => {
                const coffee = getCoffee(item.slug);
                return (
                  coffee && (
                    <div className="hrm-bag-line" key={`${item.slug}-${item.size}`}>
                      <span>
                        {coffee.name}
                        <small>
                          {item.size} · {item.quantity} bag{item.quantity > 1 ? "s" : ""}
                        </small>
                      </span>
                      <b>
                        {naira(coffee.price * (item.size === "1kg" ? 3.45 : 1) * item.quantity)}
                      </b>
                      <button onClick={() => remove(item.slug, item.size)}>Remove</button>
                    </div>
                  )
                );
              })}
              <p className="hrm-bag-total">
                Subtotal{" "}
                <b>
                  {naira(
                    items.reduce((sum, item) => {
                      const coffee = getCoffee(item.slug);
                      return (
                        sum +
                        (coffee?.price ?? 0) * (item.size === "1kg" ? 3.45 : 1) * item.quantity
                      );
                    }, 0),
                  )}
                </b>
              </p>
              <Link className="hrm-button" href="/work/harmattan/subscribe">
                Subscribe and save 10%
              </Link>
            </>
          )}
        </Layer>
      )}
    </>
  );
}

function Layer({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.focus();
  }, []);
  return (
    <div
      className="hrm-layer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
      role="presentation"
    >
      <aside
        ref={panel}
        tabIndex={-1}
        className="hrm-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <h2>{title}</h2>
          <button onClick={close} aria-label={`Close ${title}`}>
            <X />
          </button>
        </header>
        {children}
      </aside>
    </div>
  );
}
