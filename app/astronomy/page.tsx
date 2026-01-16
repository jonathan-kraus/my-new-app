import { getAstronomyForDashboard } from "@/lib/astronomy";
import AstronomyPageClient from "./AstronomyPageClient";

export default async function AstronomyPage() {
  const { allSnapshots } = await getAstronomyForDashboard("KOP");
  console.log(
    "ASTRONOMY SNAPSHOT DEBUG",
    JSON.stringify(allSnapshots, null, 2),
  );

  for (const snap of allSnapshots) {
    for (const [key, value] of Object.entries(snap)) {
      if (
        typeof value === "string" &&
        value.includes("T") &&
        !value.endsWith("Z")
      ) {
        console.log("Suspicious ISO string:", key, value);
      }
    }
  }

  if (typeof Date !== "undefined") {
    const orig = Date.prototype.toLocaleTimeString;

    Date.prototype.toLocaleTimeString = function (
      locales?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ) {
      if (!(this instanceof Date)) {
        console.error("toLocaleTimeString called on non-Date:", this);
      }
      return orig.call(this, locales, options);
    };
  }

  return <AstronomyPageClient snapshots={allSnapshots} />;
}
