"use client";

import { useEffect, useState } from "react";

export function useIsEmbedded() {
  const [isEmbedded, setIsEmbedded] = useState(readEmbeddedState);

  useEffect(() => {
    setIsEmbedded(readEmbeddedState());
  }, []);

  return isEmbedded;
}

function readEmbeddedState() {
  return (
    typeof window !== "undefined" &&
    (window.location.search.includes("embed=1") || window.self !== window.top)
  );
}
