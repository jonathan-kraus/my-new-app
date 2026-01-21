import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import BlueDashboardLayout from "@/components/layouts/BlueDashboardLayout";
import NewNoteClient from "./NewNoteClient";

export default async function NewNotePage() {
  const h = await headers(); // ✅ await the Promise
  const session = await getServerSession();

  return (
    <BlueDashboardLayout>
      <NewNoteClient
        authorized={!!session?.user}
        userId={session?.user?.id ?? "JK"}
      />
    </BlueDashboardLayout>
  );
}
