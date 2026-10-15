"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type RefObject } from "react";

import { useDismissibleLayer } from "@/src/shared/lib/useDismissibleLayer";

import { useRentbook } from "./RentbookProvider";

type CommandProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onOpenPayment: () => void;
  onOpenReset: () => void;
  onOpenMaintenance: () => void;
  onShowShortcuts: () => void;
};
type Command = { group: string; label: string; href?: string; action?: () => void };
const PAGES = [
  ["Overview", "/work/rentbook"],
  ["Rent roll", "/work/rentbook/rent-roll"],
  ["Tenants", "/work/rentbook/tenants"],
  ["Properties", "/work/rentbook/properties"],
  ["Payments", "/work/rentbook/payments"],
  ["Reports", "/work/rentbook/reports"],
  ["Maintenance", "/work/rentbook/maintenance"],
] as const;

export function RentbookCommandDialog({
  inputRef,
  onClose,
  onOpenPayment,
  onOpenReset,
  onOpenMaintenance,
  onShowShortcuts,
}: CommandProps) {
  const { state } = useRentbook();
  const panelRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  useDismissibleLayer({ isOpen: true, onDismiss: onClose, layerRef: panelRef, trapFocus: true });
  const commands: Command[] = useMemo(
    () => [
      ...state.tenants.map((tenant) => ({
        group: "Tenants",
        label: tenant.name,
        href: `/work/rentbook/tenants/${tenant.id}`,
      })),
      ...PAGES.map(([label, href]) => ({ group: "Pages", label, href })),
      { group: "Actions", label: "Record a payment", action: onOpenPayment },
      { group: "Actions", label: "New maintenance request", action: onOpenMaintenance },
      { group: "Actions", label: "Reset demo data", action: onOpenReset },
      { group: "Actions", label: "Show shortcuts", action: onShowShortcuts },
    ],
    [state.tenants, onOpenMaintenance, onOpenPayment, onOpenReset, onShowShortcuts],
  );
  const matches = commands.filter((command) => isMatch(command.label, query));
  const execute = (command: Command) => {
    command.action?.();
    onClose();
  };
  return (
    <div className="rbk-dialog">
      <section
        ref={panelRef}
        className="rbk-command-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-title"
        data-testid="command-palette"
      >
        <div className="rbk-command-heading">
          <h2 id="command-title">Find anything</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <input
          ref={inputRef}
          aria-label="Find a command"
          placeholder="Search tenants, pages or actions"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => Math.min(index + 1, matches.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => Math.max(index - 1, 0));
            }
            if (event.key === "Enter" && matches[active]) {
              execute(matches[active]);
            }
          }}
        />
        {matches.map((command, index) => (
          <div className="rbk-command-result" key={`${command.group}-${command.label}`}>
            <small>{command.group}</small>
            {command.href ? (
              <Link href={command.href} onClick={onClose}>
                {highlight(command.label, query)}
              </Link>
            ) : (
              <button
                type="button"
                aria-current={index === active}
                onClick={() => execute(command)}
              >
                {highlight(command.label, query)}
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
function isMatch(value: string, query: string) {
  let cursor = 0;
  return query
    .toLowerCase()
    .split("")
    .every((character) => {
      cursor = value.toLowerCase().indexOf(character, cursor);
      cursor += 1;
      return cursor > 0;
    });
}
function highlight(value: string, query: string) {
  const index = value.toLowerCase().indexOf(query.toLowerCase());
  return !query || index < 0 ? (
    value
  ) : (
    <>
      {value.slice(0, index)}
      <mark>{value.slice(index, index + query.length)}</mark>
      {value.slice(index + query.length)}
    </>
  );
}
