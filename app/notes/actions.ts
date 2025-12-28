"use server";

import {
  createNote,
  updateNote,
  deleteNote,
  hideNote,
} from "@/lib/server/notes";
import { redirect } from "next/navigation";

export async function createNoteAction(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await createNote({ title, content });
  redirect("/notes");
}

export async function updateNoteAction(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await updateNote(id, { title, content });
  redirect(`/notes/${id}`);
}

export async function hideNoteAction(id: string) {
  await hideNote(id);
  redirect("/notes");
}

export async function deleteNoteAction(id: string) {
  await deleteNote(id);
  redirect("/notes");
}
