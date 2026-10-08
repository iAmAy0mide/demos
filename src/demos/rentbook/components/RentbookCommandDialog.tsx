import { RotateCcw, Search, X } from "lucide-react";
import Link from "next/link";

import type { RefObject } from "react";

type RentbookCommandDialogProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onOpenPayment: () => void;
  onOpenReset: () => void;
};

export function RentbookCommandDialog({
  inputRef,
  onClose,
  onOpenPayment,
  onOpenReset,
}: RentbookCommandDialogProps) {
  return (
    <div
      className="rbk-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <section className="rbk-command-panel">
        <div className="rbk-command-heading">
          <h2 id="command-title">Quick actions</h2>
          <button type="button" onClick={onClose} aria-label="Close commands">
            <X aria-hidden="true" size={17} />
          </button>
        </div>
        <input ref={inputRef} aria-label="Find a command" placeholder="Type to find an action" />
        <Link href="/work/rentbook/rent-roll" onClick={onClose}>
          <Search aria-hidden="true" size={16} />
          Search the rent roll
        </Link>
        <button type="button" onClick={onOpenPayment}>
          <span aria-hidden="true">₦</span>Record a payment
        </button>
        <button type="button" onClick={onOpenReset}>
          <RotateCcw aria-hidden="true" size={16} />
          Reset demo data
        </button>
      </section>
    </div>
  );
}
