import { LayoutDashboard, ListFilter } from "lucide-react";
import Link from "next/link";

type RentbookMobileNavigationProps = {
  pathname: string;
  onOpenPayment: () => void;
};

export function RentbookMobileNavigation({
  pathname,
  onOpenPayment,
}: RentbookMobileNavigationProps) {
  return (
    <nav
      className="rbk-mobile-nav"
      aria-label="Rentbook mobile navigation"
      data-testid="rentbook-mobile-nav"
    >
      <Link href="/work/rentbook" aria-current={pathname === "/work/rentbook" ? "page" : undefined}>
        <LayoutDashboard aria-hidden="true" size={17} />
        Overview
      </Link>
      <Link
        href="/work/rentbook/rent-roll"
        aria-current={pathname === "/work/rentbook/rent-roll" ? "page" : undefined}
      >
        <ListFilter aria-hidden="true" size={17} />
        Rent roll
      </Link>
      <button type="button" onClick={onOpenPayment}>
        <span aria-hidden="true">₦</span>Payment
      </button>
    </nav>
  );
}
