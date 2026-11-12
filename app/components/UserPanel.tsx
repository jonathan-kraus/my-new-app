import { headers } from "next/headers";
import { auth } from "@/auth";

export default async function UserPanel() {
  await headers();

  const session = await auth();

  return <div>{session?.user?.email}</div>;
}
