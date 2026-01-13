// app/notes/page.tsx
import BlueDashboardLayout from "@/components/layouts/BlueDashboardLayout";
import NotesClient from "./NotesClient";

export const dynamic = "force-dynamic";

export default function NotesPage() {
  return (
    <BlueDashboardLayout>
      <NotesClient />
    </BlueDashboardLayout>
  );
}
