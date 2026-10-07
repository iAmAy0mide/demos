"use client";

import { useEffect, useState } from "react";

export function useLagosNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { const frame = window.requestAnimationFrame(() => setNow(new Date())); return () => window.cancelAnimationFrame(frame); }, []);
  return now;
}
