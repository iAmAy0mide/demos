"use client";

import { useState } from "react";

export function useIsEmbedded() {
  const [isEmbedded] = useState(readEmbeddedState);

  return isEmbedded;
}

function readEmbeddedState() {
  return (
    typeof window !== "undefined" &&
    (window.location.search.includes("embed=1") || window.self !== window.top)
  );
}
