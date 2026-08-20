/*
 * @FilePath: \my-new-app\app\hooks\useSideNavActivationCounter.ts
 * @LastEditTime: 2026-08-20 00:08:38
 */
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
    const next = current + 111;

    // Persist
    localStorage.setItem(key, String(next));

    // Update state
    queueMicrotask(() => {
      setCount(next);
    });
  }, [count]);

  return count;
}
