"use client";

import { useState } from "react";

type Props = {
  authorized: boolean;
  userId: string | null;
};

export default function NewNoteClient({ authorized, userId }: Props) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save note");
      } else {
        setSuccess(true);
        setContent("");
      }
    } catch (err: any) {
      setError("Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  if (!authorized) {
    return (
      <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-xl mx-auto mt-12 text-center">
        <p className="text-white/80 text-lg">You must be signed in to create notes.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-xl mx-auto mt-12 shadow-xl backdrop-blur-md">
      <h2 className="text-2xl font-semibold mb-4">Create a New Note</h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        className="w-full h-40 bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-white/60 resize-none outline-none focus:ring-2 focus:ring-blue-300"
      />

      {error && (
        <p className="text-red-300 mt-3 text-sm">{error}</p>
      )}

      {success && (
        <p className="text-green-300 mt-3 text-sm">Note saved!</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || content.trim().length === 0}
        className="mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        {saving ? "Saving..." : "Save Note"}
      </button>
    </div>
  );
}
