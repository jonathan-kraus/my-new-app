import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import NewNoteClient from "./NewNoteClient";

export const dynamic = "force-dynamic";

export default async function NewNotePage() {
  const auth = getAuth();
  const h = await headers();

  const session = await auth.api.getSession({
    headers: h,
  });

  return (
    <NewNoteClient
      authorized={!!session?.user}
      userId={session?.user?.id ?? null}
    />
  );
}
