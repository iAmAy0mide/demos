"use client";

import { type RefObject, useEffect } from "react";

type UseDismissibleLayerOptions = {
  isOpen: boolean;
  onDismiss: () => void;
  layerRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
};

export function useDismissibleLayer({ isOpen, onDismiss, layerRef, triggerRef }: UseDismissibleLayerOptions) {
  useEffect(() => {
    if (!isOpen) return;
    const dismissOnOutsidePointer = (event: PointerEvent) => {
      if (layerRef.current?.contains(event.target as Node) || triggerRef?.current?.contains(event.target as Node)) return;
      onDismiss();
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onDismiss();
      triggerRef?.current?.focus();
    };
    const dismissOnFocusLeave = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget as Node | null;
      if (!nextTarget || layerRef.current?.contains(nextTarget) || triggerRef?.current?.contains(nextTarget)) return;
      onDismiss();
    };
    document.addEventListener("pointerdown", dismissOnOutsidePointer);
    document.addEventListener("keydown", dismissOnEscape);
    document.addEventListener("focusin", dismissOnFocusLeave);
    return () => {
      document.removeEventListener("pointerdown", dismissOnOutsidePointer);
      document.removeEventListener("keydown", dismissOnEscape);
      document.removeEventListener("focusin", dismissOnFocusLeave);
    };
  }, [isOpen, layerRef, onDismiss, triggerRef]);
}
