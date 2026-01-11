type NotesClientProps = {
  notes: Array<{ id: string; title: string }> | null; // adjust fields as needed
  authorized: boolean;
  userId?: string | null; // optional if you pass it
};

export default function NotesClient({ notes, authorized }: NotesClientProps) {
  if (!authorized) {
    return (
      <div className="p-6">
        <p className="text-gray-500">You must be signed in to view notes.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Your Notes</h1>

        <a
          href="/notes/new"
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Note
        </a>
      </div>

      {notes?.length === 0 && (
        <div className="text-gray-500">You don’t have any notes yet.</div>
      )}

      {notes && notes.length > 0 && (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="p-4 border rounded-md">
              <a href={`/notes/${note.id}`} className="font-medium">
                {note.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
