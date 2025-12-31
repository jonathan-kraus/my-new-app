"use client";

import { useLogger } from "@/app/hooks/useLogger";

export default function HomePage() {
  const log = useLogger();

  log.info("HomePage rendered");

  return <div>Dashboard</div>;
}
