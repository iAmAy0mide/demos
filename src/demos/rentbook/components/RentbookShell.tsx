"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";

import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { PaymentDialog } from "./PaymentDialog";
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
  const commandInput = useRef<HTMLInputElement>(null);

  useRentbookShortcut(setIsCommandOpen);
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
        />
      ) : null}
      {isResetOpen ? (
        <RentbookResetDialog onCancel={() => setIsResetOpen(false)} onConfirm={resetDemo} />
      ) : null}
    </>
  );
}

function useRentbookShortcut(setIsCommandOpen: (isOpen: boolean) => void) {
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [setIsCommandOpen]);
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
