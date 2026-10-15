"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";

import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { PaymentDialog } from "./PaymentDialog";
import { ReceiptDialog } from "./ReceiptDialog";
import { ReminderDialog } from "./ReminderDialog";
import { RentbookCommandDialog } from "./RentbookCommandDialog";
import { RentbookHeader } from "./RentbookHeader";
import { RentbookMobileNavigation } from "./RentbookMobileNavigation";
import { useRentbook } from "./RentbookProvider";
import { RentbookResetDialog } from "./RentbookResetDialog";
import { createSeedRentbookData } from "../data/seedData";

type RentbookShellProps = { children: React.ReactNode };

export function RentbookShell({ children }: RentbookShellProps) {
  const { state, dispatch } = useRentbook();
  const pathname = usePathname();
  const now = useLagosNow();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const commandInput = useRef<HTMLInputElement>(null);

  useRentbookShortcut(setIsCommandOpen, setIsShortcutsOpen);
  useFocusCommandInput(isCommandOpen, commandInput);

  const openPayment = () => window.dispatchEvent(new Event("rentbook:payment"));
  const selectProperty = (propertyId: string) => dispatch({ type: "select_property", propertyId });
  const resetDemo = () => {
    if (!now) {
      return;
    }

    dispatch({ type: "reset", payload: createSeedRentbookData(now) });
    setIsResetOpen(false);
  };

  return (
    <>
      <RentbookHeader
        pathname={pathname}
        properties={state.properties}
        selectedPropertyId={state.selectedPropertyId}
        onOpenCommands={() => setIsCommandOpen(true)}
        onOpenReset={() => setIsResetOpen(true)}
        onOpenPayment={openPayment}
        onPropertyChange={selectProperty}
      />
      {children}
      <RentbookMobileNavigation pathname={pathname} onOpenPayment={openPayment} />
      <PaymentDialog />
      <ReceiptDialog />
      <ReminderDialog />
      {isCommandOpen ? (
        <RentbookCommandDialog
          inputRef={commandInput}
          onClose={() => setIsCommandOpen(false)}
          onOpenPayment={() => {
            setIsCommandOpen(false);
            openPayment();
          }}
          onOpenReset={() => {
            setIsCommandOpen(false);
            setIsResetOpen(true);
          }}
          onOpenMaintenance={() => window.location.assign("/work/rentbook/maintenance?new=1")}
          onShowShortcuts={() => setIsShortcutsOpen(true)}
        />
      ) : null}
      {isResetOpen ? (
        <RentbookResetDialog onCancel={() => setIsResetOpen(false)} onConfirm={resetDemo} />
      ) : null}
      {isShortcutsOpen ? (
        <div className="rbk-dialog">
          <section className="rbk-command-panel" role="dialog" aria-modal="true">
            <h2>Keyboard shortcuts</h2>
            <p>
              G then O, R, T or P navigates. P records payment. N opens maintenance. / finds
              tenants.
            </p>
            <button type="button" onClick={() => setIsShortcutsOpen(false)}>
              Close
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}

function useRentbookShortcut(
  setIsCommandOpen: (isOpen: boolean) => void,
  setIsShortcutsOpen: (isOpen: boolean) => void,
) {
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen(true);
      }
      if (event.key === "?") {
        event.preventDefault();
        setIsShortcutsOpen(true);
      }
      if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        window.dispatchEvent(new Event("rentbook:payment"));
      }
      if (event.key === "/") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>("[aria-label='Search tenants']")?.focus();
      }
      if (event.key.toLowerCase() === "n") {
        window.location.assign("/work/rentbook/maintenance?new=1");
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [setIsCommandOpen, setIsShortcutsOpen]);
}

function useFocusCommandInput(
  isCommandOpen: boolean,
  commandInput: RefObject<HTMLInputElement | null>,
) {
  useEffect(() => {
    if (isCommandOpen) {
      commandInput.current?.focus();
    }
  }, [commandInput, isCommandOpen]);
}
