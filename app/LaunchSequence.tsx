"use client";

import { useEffect, useState } from "react";

export default function LaunchSequence() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handler = () => {
      setActive(true);
      setTimeout(() => setActive(false), 3000); // sequence duration
    };

    window.addEventListener("launch-sequence", handler);
    return () => window.removeEventListener("launch-sequence", handler);
  }, []);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center
      bg-black/80 backdrop-blur-xl animate-fadeIn"
    >
      <div className="text-center space-y-4 animate-scaleUp">
        <div className="text-5xl font-bold text-white tracking-widest">
          LAUNCH SEQUENCE
        </div>

        <div className="text-3xl text-blue-300 font-mono animate-pulseSlow">
          T‑3… T‑2… T‑1…
        </div>

        <div className="rocket-container mt-8">
          <div className="rocket" />
        </div>
      </div>
    </div>
  );
}
