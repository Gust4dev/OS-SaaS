"use client";

import { useEffect } from "react";

export function ScrollToTop() {
  useEffect(() => {
    // Prevent browser from restoring scroll position
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return null;
}
