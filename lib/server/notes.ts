"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@neon/auth"; // or your auth provider

// Get all visible notes for the current user
export async function getNotes() {
  const session = await auth();
  if (!session) return [];

  return prisma.note.findMany({
    where: {
      authorId: session.user.id,
      visible: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// Get a single note (RLS will enforce access)
export async function getNoteById(id: string) {
  return prisma.note.findUnique({
    where: { id },
  });
}

// Create a new note
export async function createNote(data: { title: string; content?: string }) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  return prisma.note.create({
    data: {
      title: data.title,
      content: data.content ?? "",
      authorId: session.user.id,
    },
  });
}

// Update a note
export async function updateNote(
  id: string,
  data: { title?: string; content?: string },
) {
  return prisma.note.update({
    where: { id },
    data,
  });
}

// Soft-hide a note
export async function hideNote(id: string) {
  return prisma.note.update({
    where: { id },
    data: { visible: false },
  });
}

// Delete a note (optional)
export async function deleteNote(id: string) {
  return prisma.note.delete({
    where: { id },
  });
}
