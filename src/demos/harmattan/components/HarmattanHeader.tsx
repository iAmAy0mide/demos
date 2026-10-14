import { Menu, ShoppingBag } from "lucide-react";
import Link from "next/link";

import type { RefObject } from "react";

export const harmattanLinks = [
  ["Coffees", "/work/harmattan/coffees"],
  ["Subscribe", "/work/harmattan/subscribe"],
  ["Roast Lab", "/work/harmattan/roast-lab"],
  ["Cafés", "/work/harmattan/cafes"],
  ["Story", "/work/harmattan/story"],
  ["Journal", "/work/harmattan/journal"],
  ["Wholesale", "/work/harmattan/wholesale"],
] as const;

type HarmattanHeaderProps = {
  itemCount: number;
  bagButton: RefObject<HTMLButtonElement | null>;
  menuButton: RefObject<HTMLButtonElement | null>;
  onOpenBag: () => void;
  onOpenMenu: () => void;
};

export function HarmattanHeader({
  itemCount,
  bagButton,
  menuButton,
  onOpenBag,
  onOpenMenu,
}: HarmattanHeaderProps) {
  return (
    <header className="hrm-header">
      <Link href="/work/harmattan" className="hrm-logo" aria-label="Harmattan Coffee Co. home">
        <span>H</span>
        <b>Harmattan</b>
        <i>Coffee Co.</i>
      </Link>
      <nav aria-label="Main navigation">
        {harmattanLinks.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <button
        ref={bagButton}
        className="hrm-bag"
        onClick={onOpenBag}
        aria-label={`Open bag, ${itemCount} items`}
      >
        <ShoppingBag aria-hidden="true" size={18} />
        <span>{itemCount}</span>
      </button>
      <Link className="hrm-subscribe" href="/work/harmattan/subscribe">
        Start a subscription
      </Link>
      <button ref={menuButton} className="hrm-menu" onClick={onOpenMenu} aria-label="Open menu">
        <Menu />
      </button>
    </header>
  );
}
