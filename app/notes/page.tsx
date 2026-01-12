// app/notes/page.tsx
import { getAuth } from "@/lib/auth";
import NotesClient from "./NotesClient";
import { headers } from "next/headers";
import { logit } from "@/lib/log/server";
import BlueDashboardLayout from "@/components/layouts/BlueDashboardLayout";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const auth = getAuth();
  const h = await headers();

  await logit({
    level: "info",
    message: "In Notes page",
    page: "Notes",
    file: "app/notes/page.tsx",
    line: 11,
    data: { h, auth }
  });

  const session = await auth.api.getSession({ headers: h });

  return (
    <BlueDashboardLayout>
      <NotesClient
        authorized={!!session?.user}
        userId={session?.user?.id ?? null}
        notes={null}
      />
    </BlueDashboardLayout>
  );
}
