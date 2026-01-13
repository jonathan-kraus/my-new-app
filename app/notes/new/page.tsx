import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import BlueDashboardLayout from "@/components/layouts/BlueDashboardLayout";
import NewNoteClient from "./NewNoteClient";

export default async function NewNotePage() {
  const h = await headers(); // ← FIX: await it

  const session = await auth.api.getSession({
    headers: h, // now it's HeadersInit, not Promise<Headers>
  });

  return (
    <BlueDashboardLayout>
      <NewNoteClient
        authorized={!!session?.user}
        userId={session?.user?.id ?? null}
      />
    </BlueDashboardLayout>
  );
}
