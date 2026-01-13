// app/notes/NotesClient.tsx
"use client";

import { useEffect, useState } from "react";

export default function NotesClient() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [notes, setNotes] = useState<any[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/notes");
      const data = await res.json();

      if (res.status === 401) {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
      setNotes(data.notes ?? []);
      setUserId(data.userId ?? null);
    }

    load();
  }, []);

  if (authorized === null) {
    return <div className="p-6">Loading…</div>;
  }

  if (!authorized) {
    return <div className="p-6">You must be signed in to view notes.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Your Notes</h1>

      {notes?.length === 0 && <p>No notes yet.</p>}

      {notes?.map((note) => (
        <div key={note.id} className="mb-4 p-4 border rounded">
          <h2 className="font-semibold">{note.title}</h2>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
}
