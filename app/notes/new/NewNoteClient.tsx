"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewNoteClient({ authorized, userId }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  if (!authorized) {
    return (
      <div className="p-6 text-red-400 text-lg">
        You must be signed in to create a note.
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        userId,
      }),
    });

    if (res.ok) {
      router.push("/notes");
      router.refresh();
    } else {
      setSaving(false);
      alert("Failed to save note");
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-3xl font-semibold text-white">New Note</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full h-40 p-3 rounded-lg bg-white/5 border border-white/10 text-gray-200"
          placeholder="Write your note…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Note"}
        </button>
      </form>
    </div>
  );
}
