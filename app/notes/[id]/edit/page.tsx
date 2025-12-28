import { getNoteById } from '@/lib/server/notes';
import { updateNoteAction } from '../../actions';

export default async function EditNotePage({ params }: { params: { id: string } }) {
  const note = await getNoteById(params.id);

  if (!note) return <div>Note not found</div>;

  return (
    <form action={updateNoteAction.bind(null, note.id)} className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Edit Note</h1>

      <input name="title" defaultValue={note.title} className="border p-2 w-full" required />

      <textarea
        name="content"
        defaultValue={note.content ?? ''}
        className="border p-2 w-full h-40"
      />

      <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
    </form>
  );
}
