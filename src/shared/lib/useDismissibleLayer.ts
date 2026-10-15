"use client";

import { type RefObject, useEffect } from "react";

type UseDismissibleLayerOptions = {
  isOpen: boolean;
  onDismiss: () => void;
  layerRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
  trapFocus?: boolean;
};

export function useDismissibleLayer({
  isOpen,
  onDismiss,
  layerRef,
  triggerRef,
  trapFocus = false,
}: UseDismissibleLayerOptions) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const dismissOnOutsidePointer = (event: PointerEvent) => {
      if (
        layerRef.current?.contains(event.target as Node) ||
        triggerRef?.current?.contains(event.target as Node)
      ) {
        return;
      }
      onDismiss();
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      onDismiss();
      triggerRef?.current?.focus();
    };
    document.addEventListener("pointerdown", dismissOnOutsidePointer);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnOutsidePointer);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [isOpen, layerRef, onDismiss, triggerRef]);

  useEffect(() => {
    if (!isOpen || !trapFocus) {
      return;
    }
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const trapTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }
      const focusable = layerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        return;
      }
      const targets = Array.from(focusable);
      const first = targets[0];
      const last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapTab);
    return () => {
      document.removeEventListener("keydown", trapTab);
      window.setTimeout(() => (triggerRef?.current ?? previousFocus)?.focus(), 0);
    };
  }, [isOpen, layerRef, trapFocus, triggerRef]);
}
