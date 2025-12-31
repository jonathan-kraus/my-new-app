// app/notes/page.tsx - TYPE NOTES ✅
import { db } from "@/lib/db";
import { Note } from "@prisma/client"; // ✅ PRISMA TYPES

export default async function NotesPage() {
	const notes: Note[] = await db.note.findMany({
		// ✅ Typed array
		where: { userEmail: "jonat@gmail.com" },
		orderBy: { createdAt: "desc" },
	});

	return (
		<div>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
					Notes
				</h1>
				<button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg">
					+ New Note
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{notes.map(
					(
						note: Note, // ✅ Typed param
					) => (
						<div
							key={note.id}
							className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all group"
						>
							<h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-2 group-hover:text-purple-700">
								{note.title}
							</h3>
							{note.content && (
								<p className="text-gray-600 mb-4 line-clamp-3 text-sm">{note.content}</p>
							)}
							<div className="flex justify-between items-center text-xs text-gray-500">
								<span>{new Date(note.createdAt).toLocaleDateString()}</span>
								<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
									<button className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
									<button className="text-red-600 hover:text-red-700 font-medium">Delete</button>
								</div>
							</div>
						</div>
					),
				)}
			</div>

			{notes.length === 0 && (
				<div className="text-center py-20">
					<div className="w-24 h-24 bg-purple-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
						<span className="text-3xl">N</span>
					</div>
					<h3 className="text-2xl font-bold text-gray-500 mb-2">No notes yet</h3>
					<p className="text-gray-400 mb-6">Create your first note to get started!</p>
					<button className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:bg-purple-700">
						+ Create Note
					</button>
				</div>
			)}
		</div>
	);
}
