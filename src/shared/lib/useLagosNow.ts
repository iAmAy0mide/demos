"use client";

import { useEffect, useState } from "react";

export function useLagosNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);
  return now;
}
