// notes.ts
"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get all visible notes for the current user
export async function getNotes() {
  const session = await getServerSession(authOptions);
  console.log("SESSION:", session);
  const user = session?.user;
  console.log("user:", user);

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Your notes query here
  const notes = await db.note.findMany({});
  // where something
  return notes;
}
