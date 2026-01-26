import { auth } from "@/auth";
import { headers } from "next/headers";
import NewNoteClient from "./NewNoteClient";

export default async function NewNotePage() {
  const h = await headers(); // ✅ await the Promise
  const session = await auth();

  return (
    <NewNoteClient
      authorized={!!session?.user}
      userId={session?.user?.id ?? "JK"}
    />
  );
}
