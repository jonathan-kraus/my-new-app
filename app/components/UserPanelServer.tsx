import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function UserPanelServer() {
  const h = await headers(); // ✅ await the Promise

  const session = await auth.api.getSession({
    headers: Object.fromEntries(h.entries()), // ✅ convert to Record<string, string>
  });

  return session;
}
