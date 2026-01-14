import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import UserPanelClient from "./UserPanelClient";

export default async function UserPanel() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <UserPanelClient user={session?.user ?? null} />;
}
