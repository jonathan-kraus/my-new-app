// app/notes/page.tsx
"use client";

import { useNotes } from "./useNotes";

export const dynamic = "force-dynamic";

export default function NotesPage() {
  const state = useNotes();

  return (
    <div>
      <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-8">
        Notes
      </h1>

      <div className="p-8 bg-purple-50 rounded-2xl">
        {state.status === "loading" && <p>Loading your notes…</p>}

        {state.status === "unauthorized" && (
          <p className="text-red-600">
            You must be signed in to view your notes.
          </p>
        )}

        {state.status === "error" && (
          <p className="text-red-600">
            Something went wrong loading your notes.
          </p>
        )}

        {state.status === "ready" && state.notes.length === 0 && (
          <p className="text-gray-600">No notes yet.</p>
        )}

        {state.status === "ready" && state.notes.length > 0 && (
          <ul className="space-y-4">
            {state.notes.map((note) => (
              <li
                key={note.id}
                className="p-4 bg-white rounded-xl shadow-sm border"
              >
                <h2 className="text-xl font-semibold">{note.title}</h2>
                <p className="text-gray-700">{note.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
