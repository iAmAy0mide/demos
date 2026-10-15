import { Command, Search } from "lucide-react";
import Link from "next/link";

import type { Property } from "../types";

const links = [
  ["Overview", "/work/rentbook"],
  ["Rent roll", "/work/rentbook/rent-roll"],
  ["Tenants", "/work/rentbook/tenants"],
  ["Properties", "/work/rentbook/properties"],
  ["Payments", "/work/rentbook/payments"],
  ["Reports", "/work/rentbook/reports"],
  ["Maintenance", "/work/rentbook/maintenance"],
] as const;

type RentbookHeaderProps = {
  pathname: string;
  properties: Property[];
  selectedPropertyId: string;
  onOpenCommands: () => void;
  onOpenReset: () => void;
  onOpenPayment: () => void;
  onPropertyChange: (propertyId: string) => void;
};

export function RentbookHeader({
  pathname,
  properties,
  selectedPropertyId,
  onOpenCommands,
  onOpenReset,
  onOpenPayment,
  onPropertyChange,
}: RentbookHeaderProps) {
  return (
    <header className="rbk-top">
      <Link href="/work/rentbook" className="rbk-brand" aria-label="Rentbook overview">
        <span className="rbk-brand-mark" aria-hidden="true">
          R
        </span>
        <span>
          <strong>Rentbook</strong>
          <small>Okafor &amp; Sons Properties</small>
        </span>
      </Link>
      <nav
        className="rbk-nav"
        aria-label="Rentbook navigation"
        data-scroll-x="intentional"
        data-testid="rentbook-nav"
      >
        {links.map(([name, href]) => (
          <Link
            key={href}
            className={isCurrentRoute(pathname, href) ? "rbk-nav-active" : undefined}
            data-testid={`rentbook-nav-${href === "/work/rentbook" ? "overview" : href.split("/").at(-1)}`}
            href={href}
          >
            {name}
          </Link>
        ))}
      </nav>
      <div className="rbk-top-actions">
        <label className="rbk-property-switcher">
          <span className="rbk-sr-only">Filter by property</span>
          <select
            value={selectedPropertyId}
            onChange={(event) => onPropertyChange(event.target.value)}
          >
            <option value="all">All properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </label>
        <Link
          href="/work/rentbook/rent-roll"
          className="rbk-search-trigger"
          aria-label="Search rent roll"
        >
          <Search aria-hidden="true" size={17} />
        </Link>
        <button
          className="rbk-command-trigger"
          type="button"
          onClick={onOpenCommands}
          aria-label="Open commands"
        >
          <Command aria-hidden="true" size={16} />
        </button>
        <button className="rbk-reset-trigger" type="button" onClick={onOpenReset}>
          Reset demo
        </button>
        <button className="rbk-primary" type="button" onClick={onOpenPayment}>
          Record payment
        </button>
      </div>
    </header>
  );
}

function isCurrentRoute(pathname: string, href: string) {
  return href === "/work/rentbook"
    ? pathname === href
    : pathname.startsWith(`${href}/`) || pathname === href;
}
