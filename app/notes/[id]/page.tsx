import { getNoteById } from '@/lib/server/notes';
import Link from 'next/link';
import { hideNoteAction, deleteNoteAction } from '../actions';

export default async function NoteDetail({ params }: { params: { id: string } }) {
  const note = await getNoteById(params.id);

  if (!note) return <div>Note not found</div>;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-4xl font-bold">{note.title}</h1>
      <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>

      <div className="flex gap-4 mt-6">
        <Link
          href={`/notes/${note.id}/edit`}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Edit
        </Link>

        <form action={hideNoteAction.bind(null, note.id)}>
          <button className="px-4 py-2 bg-gray-600 text-white rounded">Hide</button>
        </form>

        <form action={deleteNoteAction.bind(null, note.id)}>
          <button className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
        </form>
      </div>
    </div>
  );
}
