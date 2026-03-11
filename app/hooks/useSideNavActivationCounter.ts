"use client";
// app\hooks\useSideNavActivationCounter.ts
import { useEffect, useState } from "react";

export function useSideNavActivationCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const key = "sidenav-activations";

    // Read existing count
    const current = Number(localStorage.getItem(key) ?? "0");

    // Increment
    const next = current + 1;

    // Persist
    localStorage.setItem(key, String(next));

    // Update state
    setCount(next);
  }, []);

  return count;
}
