// app/notes/new/page.tsx
import { getAuth } from "@/lib/auth";
import BlueDashboardLayout from "@/components/layouts/BlueDashboardLayout";
import NewNoteClient from "./NewNoteClient";

export const dynamic = "force-dynamic";

export default async function NewNotePage() {
  const auth = getAuth();
  const session = await auth.api.getSession();

  return (
    <BlueDashboardLayout>
      <NewNoteClient
        authorized={!!session?.user}
        userId={session?.user?.id ?? null}
      />
    </BlueDashboardLayout>
  );
}
