import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function UserPanel() {
  const h = await headers();

  const session = await auth();

  return <div>{session?.user?.email}</div>;
}
