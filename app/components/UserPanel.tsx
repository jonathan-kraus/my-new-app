import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function UserPanel() {
  const h = await headers();

  const session = await auth.api.getSession({
    headers: Object.fromEntries(h.entries()),
  });

  return <div>{session?.user?.email}</div>;
}
