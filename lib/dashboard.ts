// lib/dashboard.ts
import { getFormattedVercelUsage } from "./vercel";
//import { getAstronomySnapshot } from "./astronomy";
import { getRecentActivity } from "./github";
//import { getWeather } from "./weather";
//import { getRecentLogs } from "./logs";

export async function getDashboardData() {
  const [vercel, github] = await Promise.all([
    getFormattedVercelUsage(),
    getRecentActivity("jonathan-kraus"),
  ]);

  return {
    vercel,
    github,
    system: {
      generatedAt: new Date().toISOString(),
    },
  };
}
