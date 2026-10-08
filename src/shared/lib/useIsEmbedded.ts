"use client";

import { useEffect, useState } from "react";

export function useIsEmbedded() {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsEmbedded(window.location.search.includes("embed=1") || window.self !== window.top);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return isEmbedded;
}
