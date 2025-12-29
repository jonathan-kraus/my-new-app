// app/notes/page.tsx ← NEW
import { db } from "@/lib/db";
import getServerSession from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export default async function NotesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return <div>Please sign in</div>;
  }

  // const notes = await db.note.findMany({
  // 	where: { userEmail: session.user.email },
  // 	orderBy: { createdAt: "desc" },
  // });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* <h1 className="text-3xl font-bold mb-8">Your Notes ({notes.length})</h1> */}

      {/* {notes.length === 0 ? (
				<p className="text-gray-500">No notes yet. Add some!</p>
			) : ( */}
      <div className="space-y-4">
        {/* {notes.map((note) => (
						<div key={note.id} className="p-6 bg-white border rounded-lg shadow-sm">
							<h2 className="text-xl font-semibold mb-2">{note.title}</h2>
							{note.content && <p className="text-gray-700 mb-4">{note.content}</p>}
							<p className="text-sm text-gray-500">
								{new Date(note.createdAt).toLocaleDateString()}
							</p>
						</div>
					))} */}
      </div>
      {/* )} */}

      <div className="mt-8 p-4 bg-blue-50 border rounded-lg">
        <h3 className="font-semibold mb-2">Test API:</h3>
        <pre className="text-sm bg-white p-3 rounded text-gray-800">
          {/* GET /api/notes → {JSON.stringify(notes.slice(0, 2), null, 2)} */}
        </pre>
      </div>
    </div>
  );
}
