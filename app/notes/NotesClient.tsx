// app/notes/NotesClient.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function NotesClient() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [notes, setNotes] = useState<any[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<any[] | null>(null);

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
    const filtered = notes.filter(note => 
      (note.title && note.title.toLowerCase().includes(query)) ||
      (note.content && note.content.toLowerCase().includes(query))
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
        setNotes(notes?.filter(note => note.id !== id) ?? []);
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
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes(notes?.map(note => 
          note.id === editingId ? data.note : note
        ) ?? []);
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
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
        <p>{searchQuery ? "No notes found matching your search." : "No notes yet."}</p>
      )}

      {filteredNotes?.map((note) => (
        <div key={note.id} className="mb-4 p-4 border rounded bg-white/10 backdrop-blur-md">
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
                <h2 className="font-semibold text-lg">{note.title || "Untitled"}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-white/80 whitespace-pre-wrap">{note.content}</p>
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
