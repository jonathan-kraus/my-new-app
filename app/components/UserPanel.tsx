import { getServerSession } from "next-auth";
import { headers } from "next/headers";

export default async function UserPanel() {
  const h = await headers();

  const session = await getServerSession();

  return <div>{session?.user?.email}</div>;
}
