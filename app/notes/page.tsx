import { getAuth } from "@/lib/auth";
import NotesClient from "./NotesClient";

export default async function NotesPage() {
  const auth = getAuth();
  const session = await auth.api.getSession();

  return (
    <NotesClient
      authorized={!!session?.user}
      userId={session?.user?.id ?? null}
      notes={null} // ⭐ add this
    />
  );
}
