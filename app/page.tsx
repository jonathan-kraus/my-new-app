"use client";

import { useEffect } from "react";
import { logit } from "@/lib/log/client";
import { useLogger } from "@/app/hooks/useLogger";

export default function HomePage() {
  const { info } = useLogger();

  useEffect(() => {
    logit({
      level: "info",
      message: "Visited dashboard",
      page: "/",
      line: 11,
      sessionUser: "Jonathan"
    });
    info("Visited dashboard");
  }, []);

  return <div>Dashboard</div>;
}
