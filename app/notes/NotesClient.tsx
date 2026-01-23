// app/notes/NotesClient.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function NotesClient() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<any[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editNeedsFollowUp, setEditNeedsFollowUp] = useState(false);
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editColor, setEditColor] = useState("");

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
  const [notes, setNotes] = useState<any[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/notes");
      const data = await res.json();

      if (res.status === 401) {
        toast.error(
          "🛑 Access denied — authentication required for this mission.",
        );
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
      setNotes(data.notes ?? []);
      setFilteredNotes(data.notes ?? []);
      setUserId(data.userId ?? null);
    }

    load();
  }, []);

  useEffect(() => {
    if (!notes) return;

    if (searchQuery.trim() === "") {
      setFilteredNotes(notes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = notes.filter(
      (note) =>
        (note.title && note.title.toLowerCase().includes(query)) ||
        (note.content && note.content.toLowerCase().includes(query)),
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`/api/notes?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotes(notes?.filter((note) => note.id !== id) ?? []);
        toast.success("Note deleted successfully");
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      toast.error("Error deleting note");
    }
  };

  const handleEdit = (note: any) => {
    setEditingId(note.id);
    setEditTitle(note.title || "");
    setEditContent(note.content || "");
    setEditNeedsFollowUp(!!note.followUpAt);
    setEditFollowUpDate(
      note.followUpAt
        ? new Date(note.followUpAt).toISOString().slice(0, 16)
        : "",
    );
    setEditColor(note.color || "");
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isArchived: true,
        }),
      });

      if (res.ok) {
        setNotes(notes?.filter((note) => note.id !== id) ?? []);
        toast.success("Note archived successfully");
      } else {
        toast.error("Failed to archive note");
      }
    } catch (error) {
      toast.error("Error archiving note");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: editTitle,
          content: editContent,
          followUpAt:
            editNeedsFollowUp && editFollowUpDate
              ? new Date(editFollowUpDate).toISOString()
              : null,
          color: editColor || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes(
          notes?.map((note) => (note.id === editingId ? data.note : note)) ??
            [],
        );
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
        setEditNeedsFollowUp(false);
        setEditFollowUpDate("");
        setEditColor("");
        toast.success("Note updated successfully");
      } else {
        toast.error("Failed to update note");
      }
    } catch (error) {
      toast.error("Error updating note");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditNeedsFollowUp(false);
    setEditFollowUpDate("");
    setEditColor("");
  };

  if (authorized === null) {
    return <div className="p-6">Loading…</div>;
  }

  if (!authorized) {
    return <div className="p-6">You must be signed in to view notes.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Your Notes</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => (window.location.href = "/notes/new")}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          New Note
        </button>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="flex-1 px-4 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {filteredNotes?.length === 0 && (
        <p>
          {searchQuery
            ? "No notes found matching your search."
            : "No notes yet."}
        </p>
      )}

      {filteredNotes?.map((note) => (
        <div
          key={note.id}
          className={`mb-4 p-4 border rounded backdrop-blur-md ${
            note.color
              ? `bg-${note.color}-500/20 border-${note.color}-500/30`
              : "bg-white/10"
          }`}
        >
          {editingId === note.id ? (
            <div>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full mb-2 p-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/60"
                placeholder="Note title..."
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-32 p-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/60 resize-none"
                placeholder="Note content..."
              />

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editFollowUp"
                    checked={editNeedsFollowUp}
                    onChange={(e) => setEditNeedsFollowUp(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-600"
                  />
                  <label htmlFor="editFollowUp" className="text-white text-sm">
                    Needs follow-up
                  </label>
                </div>

                {editNeedsFollowUp && (
                  <input
                    type="datetime-local"
                    value={editFollowUpDate}
                    onChange={(e) => setEditFollowUpDate(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded p-2 text-white text-sm"
                  />
                )}
              </div>

              <div className="mt-3">
                <label className="block text-white text-sm mb-2">Color:</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setEditColor(colorOption.value)}
                      className={`w-6 h-6 rounded-full border-2 ${colorOption.className} ${
                        editColor === colorOption.value
                          ? "border-white ring-2 ring-white/50"
                          : "border-white/30 hover:border-white/60"
                      }`}
                      title={colorOption.label}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {note.color && (
                    <div
                      className={`w-4 h-4 rounded-full bg-${note.color}-500`}
                    />
                  )}
                  <h2 className="font-semibold text-lg">
                    {note.title || "Untitled"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchive(note.id)}
                    className="px-2 py-1 text-sm rounded bg-yellow-600 text-white hover:bg-yellow-700 transition"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="text-white/80 whitespace-pre-wrap">
                {note.content}
              </p>

              {note.followUpAt && (
                <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded">
                  <p className="text-yellow-300 text-sm">
                    📅 Follow-up: {new Date(note.followUpAt).toLocaleString()}
                  </p>
                </div>
              )}

              <p className="text-xs text-white/60 mt-2">
                Created: {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
