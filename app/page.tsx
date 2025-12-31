"use client";

import { useEffect } from "react";
import { useLogger } from "@/app/hooks/useLogger";

export default function HomePage() {
  const { info } = useLogger();

  useEffect(() => {
    info("HomePage rendered");
  }, []);

  return <div>Dashboard</div>;
}
