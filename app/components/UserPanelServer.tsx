import { headers } from "next/headers";
import { auth } from "@/auth";

export default async function UserPanelServer() {
  await headers(); // ✅ await the Promise

  const session = await auth();

  return session;
}
