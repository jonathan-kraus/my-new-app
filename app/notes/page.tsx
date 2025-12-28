import { getNotes } from "@/lib/server/notes";
import Link from "next/link";

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Your Notes</h1>

      <Link
        href="/notes/new"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        New Note
      </Link>

      <div className="mt-6 space-y-4">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="block p-4 border rounded hover:bg-gray-50"
          >
            <h2 className="text-xl font-semibold">{note.title}</h2>
            <p className="text-gray-600">{note.content?.slice(0, 100)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
