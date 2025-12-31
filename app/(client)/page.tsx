// app/(client)/page.tsx - NO SIDEBAR HERE
export default function HomePage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to Weather Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Home content only - NO sidebar */}
      </div>
    </div>
  );
}
