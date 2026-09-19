import { auth } from "@/auth";
import { headers } from "next/headers";

export default async function UserPanel() {
  await headers();

  const session = await auth();

  return <div>{session?.user?.email}</div>;
}
