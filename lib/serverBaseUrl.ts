// lib/serverBaseUrl.ts
import { headers } from "next/headers";

export async function getServerBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  console.log("host", host, "proto", proto);
  return `${proto}://${host}`;
}
