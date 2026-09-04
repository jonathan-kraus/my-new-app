"use client";
// app/notes/useNotes.ts

import { useEffect, useState } from "react";
import { logj } from "@/lib/log/logj";

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
    let jei = 0;
    logj({
      domain: "notes",
      level: "info",
      message: "Notes page mounted",
      file: "app/notes/useNotes.ts",
      line: 27,
      payload: { loc: "/notes" },
      meta: { built: { eventIndex: ++jei } },
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

        let jei = 0;
        logj({
          domain: "notes",
          level: "error",
          message: "Notes page error",
          file: "app/notes/useNotes.ts",
          line: 59,
          payload: { loc: "/notes" },
          meta: { built: { eventIndex: ++jei } },
        });
      }
    }

    load();
  }, []);

  return state;
}
