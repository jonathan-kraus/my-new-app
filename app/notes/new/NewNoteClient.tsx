"use client";

import { useState } from "react";
import { logFromClient } from "@/app/actions/log";

type Props = {
  authorized: boolean;
  userId: string;
};

export default function NewNoteClient({ authorized, userId }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [needsFollowUp, setNeedsFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [color, setColor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const colorOptions = [
    { value: "", label: "None", className: "bg-gray-500" },
    { value: "red", label: "Red", className: "bg-red-500" },
    { value: "blue", label: "Blue", className: "bg-blue-500" },
    { value: "green", label: "Green", className: "bg-green-500" },
    { value: "yellow", label: "Yellow", className: "bg-yellow-500" },
    { value: "purple", label: "Purple", className: "bg-purple-500" },
    { value: "pink", label: "Pink", className: "bg-pink-500" },
    { value: "orange", label: "Orange", className: "bg-orange-500" },
  ];
  const ctx = {
    requestId: crypto.randomUUID(),
    page: "note",
    userId: "JK",
  };
  
  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          content,
          followUpAt: needsFollowUp && followUpDate ? new Date(followUpDate).toISOString() : null,
          color: color || null
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save note");
      } else {
        setSuccess(true);
        setTitle("");
        setContent("");
        setNeedsFollowUp(false);
        setFollowUpDate("");
        setColor("");
        setTimeout(() => {
          window.location.href = "/notes";
        }, 1500);
      }
    } catch (err: any) {
      await logFromClient("notes", {
        level: "error",
        message: "Failed to create note",
      });

      console.error("NOTES API ERROR", err);
      setError("Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  if (!authorized) {
    return (
      <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-xl mx-auto mt-12 text-center">
        <p className="text-white/80 text-lg">
          You must be signed in to create notes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-xl mx-auto mt-12 shadow-xl backdrop-blur-md">
      <h2 className="text-2xl font-semibold mb-4">Create a New Note</h2>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title (optional)..."
        className="w-full mb-4 bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-blue-300"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        className="w-full h-40 bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-white/60 resize-none outline-none focus:ring-2 focus:ring-blue-300"
      />

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="followUp"
            checked={needsFollowUp}
            onChange={(e) => setNeedsFollowUp(e.target.checked)}
            className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="followUp" className="text-white text-sm">
            Needs follow-up
          </label>
        </div>

        {needsFollowUp && (
          <div>
            <label htmlFor="followUpDate" className="block text-white text-sm mb-1">
              Follow-up date:
            </label>
            <input
              type="datetime-local"
              id="followUpDate"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-white text-sm mb-2">Color:</label>
        <div className="flex gap-2 flex-wrap">
          {colorOptions.map((colorOption) => (
            <button
              key={colorOption.value}
              type="button"
              onClick={() => setColor(colorOption.value)}
              className={`w-8 h-8 rounded-full border-2 ${colorOption.className} ${
                color === colorOption.value 
                  ? 'border-white ring-2 ring-white/50' 
                  : 'border-white/30 hover:border-white/60'
              }`}
              title={colorOption.label}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-red-300 mt-3 text-sm">{error}</p>}

      {success && <p className="text-green-300 mt-3 text-sm">Note saved! Redirecting...</p>}

      <button
        onClick={handleSave}
        disabled={saving || content.trim().length === 0}
        className="mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        {saving ? "Saving..." : "Save Note"}
      </button>
      
      <button
        onClick={() => window.location.href = "/notes"}
        className="mt-4 ml-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
