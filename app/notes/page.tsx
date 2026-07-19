// app/notes/page.tsx

import NotesClient from "./NotesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notes" };
export default function NotesPage() {
  return <NotesClient />;
}
