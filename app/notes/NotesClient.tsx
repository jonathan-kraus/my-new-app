/*
 * @FilePath: \my-new-app\app\notes\NotesClient.tsx
 * @LastEditTime: 2026-11-08 22:50:11
 */
// app/notes/NotesClient.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { logj } from "@/lib/log/logj";

type Note = {
  id: string;
  title?: string | null;
  content?: string | null;
  followUpAt?: string | null;
  color?: string | null;
  createdAt: string;
  isArchived?: boolean;
  isCompleted?: boolean;
};

const noteColorClasses: Record<string, { card: string; indicator: string }> = {
  red: {
    card: "bg-red-500/20 border-red-500/30",
    indicator: "bg-red-500",
  },
  blue: {
    card: "bg-blue-500/20 border-blue-500/30",
    indicator: "bg-blue-500",
  },
  green: {
    card: "bg-green-500/20 border-green-500/30",
    indicator: "bg-green-500",
  },
  yellow: {
    card: "bg-yellow-500/20 border-yellow-500/30",
    indicator: "bg-yellow-500",
  },
  purple: {
    card: "bg-purple-500/20 border-purple-500/30",
    indicator: "bg-purple-500",
  },
  pink: {
    card: "bg-pink-500/20 border-pink-500/30",
    indicator: "bg-pink-500",
  },
  orange: {
    card: "bg-orange-500/20 border-orange-500/30",
    indicator: "bg-orange-500",
  },
};

const formatDateTimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

export default function NotesClient() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editNeedsFollowUp, setEditNeedsFollowUp] = useState(false);
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editColor, setEditColor] = useState("");
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [followupsDueCount, setFollowupsDueCount] = useState<number>(0);
  const [showFollowupsOnly, setShowFollowupsOnly] = useState(false);
  const [pendingNoteActions, setPendingNoteActions] = useState<
    Record<string, "archive" | "delete">
  >({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  const isFollowupDueSoon = (note: Note) => {
    if (!note.followUpAt) return false;
    const now = new Date();
    const dueAt = new Date(note.followUpAt);
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 7);
    return dueAt >= now && dueAt <= deadline;
  };

  const refreshFollowupsDueCount = async () => {
    try {
      const dueRes = await fetch("/api/notes/due?days=7");
      if (dueRes.ok) {
        const dueData = await dueRes.json();
        setFollowupsDueCount(dueData.total ?? 0);
      } else {
        setFollowupsDueCount(0);
      }
    } catch (err) {
      setFollowupsDueCount(0);
      console.error("Error fetching follow-ups due count:", err);
    }
  };

  // Initial load: notes, user, auth, followups
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notes");

        if (res.status === 401) {
          toast.error(
            "🛑 Access denied — Authentication required for this mission.",
          );
          setAuthorized(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Notes request failed with status ${res.status}`);
        }

        const data = await res.json();
        setNotes(data.notes ?? []);
        setAuthorized(true);
        await refreshFollowupsDueCount();
      } catch (error) {
        console.error("Error loading notes:", error);
        setLoadError(
          "Unable to load notes. Please refresh the page to try again.",
        );
        setAuthorized(false);
      }
    }

    void load();
  }, [refreshFollowupsDueCount]);

  useEffect(() => {
    void logj.info({
      domain: "notes",
      message: "Notes client loaded",
      file: "NotesClient.tsx",
      line: 55,
    });
  }, []);

  // Pure derived filtering: no setState, no effect needed
  const { activeNotes, archivedNotes } = useMemo(() => {
    if (!notes) return { activeNotes: [], archivedNotes: [] };
    const query = searchQuery.trim().toLowerCase();
    const matches = (note: Note) => {
      if (showFollowupsOnly && !isFollowupDueSoon(note)) return false;
      if (!query) return true;
      return Boolean(
        note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query),
      );
    };

    return {
      activeNotes: notes.filter((note) => !note.isArchived && matches(note)),
      archivedNotes: query
        ? notes.filter((note) => note.isArchived && matches(note))
        : [],
    };
  }, [notes, showFollowupsOnly, searchQuery, isFollowupDueSoon]);

  const isSearching = searchQuery.trim().length > 0;
  const visibleNotes = [...activeNotes, ...archivedNotes];

  const handleDelete = async (id: string) => {
    if (pendingNoteActions[id]) return;
    if (!confirm("Permanently delete this note? This cannot be undone.")) {
      return;
    }

    setPendingNoteActions((currentActions) => ({
      ...currentActions,
      [id]: "delete",
    }));
    try {
      const res = await fetch(`/api/notes?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotes(
          (currentNotes) =>
            currentNotes?.filter((note) => note.id !== id) ?? [],
        );
        toast.success("Note deleted successfully");
        await refreshFollowupsDueCount();
      } else {
        toast.error("Failed to delete note");
      }
    } catch {
      toast.error("Error deleting note");
    } finally {
      setPendingNoteActions((currentActions) => {
        const nextActions = { ...currentActions };
        delete nextActions[id];
        return nextActions;
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title || "");
    setEditContent(note.content || "");
    setEditNeedsFollowUp(!!note.followUpAt);
    setEditFollowUpDate(
      note.followUpAt ? formatDateTimeLocal(note.followUpAt) : "",
    );
    setEditColor(note.color || "");
  };

  const handleArchive = async (id: string) => {
    if (pendingNoteActions[id]) return;
    setPendingNoteActions((currentActions) => ({
      ...currentActions,
      [id]: "archive",
    }));
    try {
      const res = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isArchived: true,
          isCompleted: true,
        }),
      });

      if (res.ok) {
        setNotes(
          (currentNotes) =>
            currentNotes?.map((note) =>
              note.id === id
                ? { ...note, isArchived: true, isCompleted: true }
                : note,
            ) ?? [],
        );
        toast.success("Note archived successfully");
        await refreshFollowupsDueCount();
      } else {
        toast.error("Failed to archive note");
      }
    } catch {
      toast.error("Error archiving note");
    } finally {
      setPendingNoteActions((currentActions) => {
        const nextActions = { ...currentActions };
        delete nextActions[id];
        return nextActions;
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId || isSavingEdit) return;

    const noteId = editingId;
    setIsSavingEdit(true);
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
          (currentNotes) =>
            currentNotes?.map((note) =>
              note.id === noteId ? data.note : note,
            ) ?? [],
        );
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
        setEditNeedsFollowUp(false);
        setEditFollowUpDate("");
        setEditColor("");
        toast.success("Note updated successfully");
        await refreshFollowupsDueCount();
      } else {
        toast.error("Failed to update note");
      }
    } catch {
      toast.error("Error updating note");
    } finally {
      setIsSavingEdit(false);
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
    return (
      <div className="p-6">
        {loadError ? (
          <p role="alert">{loadError}</p>
        ) : (
          "You must be signed in to view notes."
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Your Notes</h1>

      {followupsDueCount > 0 && (
        <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-orange-100">
          <p className="font-semibold">
            You have {followupsDueCount} note
            {followupsDueCount === 1 ? "" : "s"} needing follow-up in the next 7
            days.
          </p>
          <p className="text-sm text-orange-100/80">
            Review or update them now to stay on top of your pending tasks.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => router.push("/notes/new")}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            New Note
          </button>
          <button
            type="button"
            onClick={() => setShowFollowupsOnly((value) => !value)}
            className={`px-4 py-2 rounded transition ${showFollowupsOnly ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {showFollowupsOnly
              ? "Show all notes"
              : `View follow-ups${
                  followupsDueCount > 0 ? ` (${followupsDueCount})` : ""
                }`}
          </button>
        </div>

        <label className="sr-only" htmlFor="note-search">
          Search notes
        </label>
        <input
          id="note-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="flex-1 px-4 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {visibleNotes.length === 0 && (
        <p>
          {searchQuery
            ? "No notes found matching your search."
            : "No notes yet."}
        </p>
      )}

      {isSearching && activeNotes.length > 0 && (
        <h2 className="mb-3 text-lg font-semibold">
          Active notes ({activeNotes.length})
        </h2>
      )}
      {activeNotes.map((note) => (
        <div
          key={note.id}
          className={`mb-4 p-4 border rounded backdrop-blur-md ${
            note.color
              ? (noteColorClasses[note.color]?.card ??
                "bg-white/10 border-white/15")
              : "bg-white/10 border-white/15"
          }`}
        >
          {editingId === note.id ? (
            <div>
              <input
                type="text"
                aria-label="Note title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isSavingEdit}
                className="w-full mb-2 p-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/60"
                placeholder="Note title..."
              />
              <textarea
                aria-label="Note content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={isSavingEdit}
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
                    disabled={isSavingEdit}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-600"
                  />
                  <label htmlFor="editFollowUp" className="text-white text-sm">
                    Needs follow-up
                  </label>
                </div>

                {editNeedsFollowUp && (
                  <input
                    type="datetime-local"
                    aria-label="Follow-up date and time"
                    value={editFollowUpDate}
                    onChange={(e) => setEditFollowUpDate(e.target.value)}
                    disabled={isSavingEdit}
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
                      aria-label={`Select ${colorOption.label} note color`}
                      aria-pressed={editColor === colorOption.value}
                      disabled={isSavingEdit}
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
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
                >
                  {isSavingEdit ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSavingEdit}
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
                      className={`w-4 h-4 rounded-full ${
                        noteColorClasses[note.color]?.indicator ?? "bg-gray-500"
                      }`}
                    />
                  )}
                  <h2 className="font-semibold text-lg">
                    {note.title || "Untitled"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(note)}
                    disabled={!!pendingNoteActions[note.id]}
                    className="px-2 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleArchive(note.id)}
                    disabled={!!pendingNoteActions[note.id]}
                    className="px-2 py-1 text-sm rounded bg-yellow-600 text-white hover:bg-yellow-700 transition"
                  >
                    {pendingNoteActions[note.id] === "archive"
                      ? "Archiving…"
                      : "Archive"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    disabled={!!pendingNoteActions[note.id]}
                    className="px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    {pendingNoteActions[note.id] === "delete"
                      ? "Deleting…"
                      : "Delete"}
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
      {isSearching && archivedNotes.length > 0 && (
        <>
          <h2 className="mb-3 mt-6 text-lg font-semibold">
            Archived notes ({archivedNotes.length})
          </h2>
          {archivedNotes.map((note) => (
            <div
              key={note.id}
              className="mb-4 rounded border border-white/15 bg-white/5 p-4 opacity-80"
            >
              <h3 className="mb-2 font-semibold text-lg">
                {note.title || "Untitled"}
              </h3>
              <p className="whitespace-pre-wrap text-white/80">
                {note.content}
              </p>
              <p className="mt-2 text-xs text-white/60">
                Created: {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
