import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function UserPanelServer() {
  await headers(); // ✅ await the Promise

  const session = await auth();

  return session;
}
