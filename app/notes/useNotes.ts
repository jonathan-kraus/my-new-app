"use client";
// app/notes/useNotes.ts

import { useEffect, useState } from "react";
import { logit } from "@/lib/log/client";

export type Note = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  userEmail: string | null;
};

type NotesState =
  | { status: "loading" }
  | { status: "unauthorized" }
  | { status: "error" }
  | { status: "ready"; notes: Note[] };

export function useNotes(): NotesState {
  const [state, setState] = useState<NotesState>({ status: "loading" });

  useEffect(() => {
    logit({
      level: "info",
      message: "Notes page mounted",
      page: "/notes",
    });

    async function load() {
      try {
        const res = await fetch("/api/notes", {
          credentials: "include",
        });

        if (res.status === 401) {
          setState({ status: "unauthorized" });
          return;
        }

        if (!res.ok) {
          setState({ status: "error" });
          return;
        }

        const notes = await res.json();
        setState({ status: "ready", notes });
      } catch {
        setState({ status: "error" });
      }
    }

    load();
  }, []);

  return state;
}
