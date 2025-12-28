import { createNoteAction } from '../actions';

export default function NewNotePage() {
  return (
    <form action={createNoteAction} className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">New Note</h1>

      <input name="title" placeholder="Title" className="border p-2 w-full" required />

      <textarea name="content" placeholder="Content" className="border p-2 w-full h-40" />

      <button className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
    </form>
  );
}
