"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { useRentbook } from "./RentbookProvider";
import { PaymentDialog } from "./PaymentDialog";

const links = [
  ["Overview", "/work/rentbook"], ["Rent roll", "/work/rentbook/rent-roll"],
  ["Tenants", "/work/rentbook/tenants"], ["Properties", "/work/rentbook/properties"],
  ["Payments", "/work/rentbook/payments"], ["Reports", "/work/rentbook/reports"],
  ["Maintenance", "/work/rentbook/maintenance"],
] as const;

type RentbookShellProps = { children: React.ReactNode };

export function RentbookShell({ children }: RentbookShellProps) {
  const { state, dispatch } = useRentbook();
  const pathname = usePathname();

  return <>
    <header className="rbk-top">
      <Link href="/work/rentbook" className="rbk-brand" aria-label="Rentbook overview">
        <span className="rbk-brand-mark" aria-hidden="true">R</span>
        <span><strong>Rentbook</strong><small>Okafor &amp; Sons Properties</small></span>
      </Link>
      <nav className="rbk-nav" aria-label="Rentbook navigation">
        {links.map(([name, href]) => <Link key={href} className={pathname === href ? "rbk-nav-active" : undefined} href={href}>{name}</Link>)}
      </nav>
      <div className="rbk-top-actions">
        <label className="rbk-property-switcher">
          <span className="rbk-sr-only">Filter by property</span>
          <select value={state.selectedPropertyId} onChange={(event) => dispatch({ type: "select_property", propertyId: event.target.value })}>
            <option value="all">All properties</option>
            {state.properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
          </select>
        </label>
        <Link href="/work/rentbook/rent-roll" className="rbk-search-trigger" aria-label="Search rent roll"><Search aria-hidden="true" size={17} /></Link>
        <button className="rbk-primary" onClick={() => window.dispatchEvent(new Event("rentbook:payment"))}>Record payment</button>
      </div>
    </header>
    {children}
    <PaymentDialog />
  </>;
}
