"use client";

import { useEffect, useState } from "react";
import { appLog } from "@/lib/logger";
export const dynamic = "force-dynamic";

type Note = {
	id: string;
	title: string;
	content: string | null;
	createdAt: string;
	updatedAt: string;
	userEmail: string | null;
};

export default function NotesPage() {
	const [notes, setNotes] = useState<Note[] | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {

				appLog({ level: "info", message: "Notes initialized", page: "app/notes/page.tsx" });
		async function loadNotes() {
			try {
				const res = await fetch("/api/notes", {
					method: "GET",
					credentials: "include",
				});

				if (!res.ok) {
					setNotes([]); // now valid
					setLoading(false);
					return;
				}

				const data = await res.json();
				setNotes(data);
			} catch (err) {
				console.error("Notes fetch error:", err);
				setNotes([]); // also valid
			} finally {
				setLoading(false);
			}
		}

		loadNotes();
	}, []);

	return (
		<div>
			<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-8">
				Notes
			</h1>

			<div className="p-8 bg-purple-50 rounded-2xl">
				{loading && <p>Loading your notes…</p>}

				{!loading && notes?.length === 0 && <p className="text-gray-600">No notes yet.</p>}

				{!loading && notes && notes.length > 0 && (
					<ul className="space-y-4">
						{notes.map((note) => (
							<li key={note.id} className="p-4 bg-white rounded-xl shadow-sm border">
								<h2 className="text-xl font-semibold">{note.title}</h2>
								<p className="text-gray-700">{note.content}</p>
								<p className="text-sm text-gray-500 mt-2">
									{new Date(note.createdAt).toLocaleString()}
								</p>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
