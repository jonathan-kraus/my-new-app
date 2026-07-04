import type { NextWebVitalsMetric } from "next/app";
import { axiomIngest } from "@/lib/axiom/server";

export function reportWebVitals(metric: NextWebVitalsMetric) {
  axiomIngest([
    {
      domain: "webvitals",
      level: "info",
      message: metric.name,
      value: metric.value,
      id: metric.id,
      meta_json: JSON.stringify(metric),
    },
  ]);
}
