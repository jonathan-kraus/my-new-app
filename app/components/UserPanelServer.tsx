import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function UserPanelServer() {
  const h = await headers(); // ✅ await the Promise

  const session = await auth();

  return session;
}
