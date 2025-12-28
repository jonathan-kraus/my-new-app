'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';

// Get all visible notes for the current user
export async function getNotes() {
  const session = await auth.api.getSession();
  console.log('SESSION:', session);
  const user = session?.user;
  console.log('user:', user);

  if (!user) return [];

  return db.note.findMany({
    where: {
      authorId: user.id,
      visible: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getNoteById(id: string) {
  return db.note.findUnique({
    where: { id },
  });
}

export async function createNote(data: { title: string; content?: string }) {
  const user = await auth.user();

  if (!user) throw new Error('Not authenticated');

  return db.note.create({
    data: {
      title: data.title,
      content: data.content ?? '',
      authorId: user.id,
    },
  });
}

export async function updateNote(id: string, data: { title?: string; content?: string }) {
  return db.note.update({
    where: { id },
    data,
  });
}

export async function hideNote(id: string) {
  return db.note.update({
    where: { id },
    data: { visible: false },
  });
}

export async function deleteNote(id: string) {
  return db.note.delete({
    where: { id },
  });
}
