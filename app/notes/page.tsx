import { getAuth } from "@/lib/auth";
import NotesClient from "./NotesClient";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: headers(),
  });

  return (
    <NotesClient
      authorized={!!session?.user}
      userId={session?.user?.id ?? null}
      notes={null}
    />
  );
}

