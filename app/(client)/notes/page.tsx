// app/(client)/notes/page.tsx - NO PRISMA (TEMP)
export const dynamic = 'force-dynamic';

export default function NotesPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-8">
        Notes
      </h1>
      <div className="p-8 bg-purple-50 rounded-2xl">
        <p>Notes loading... (Prisma WASM fixed soon)</p>
      </div>
    </div>
  );
}
