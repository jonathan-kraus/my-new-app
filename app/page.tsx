// app/page.tsx ← HOMEPAGE ONLY (no signin)
export default async function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-20">
        <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          Weather Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Real-time forecasts, beautiful UI, and your personal weather hub.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🌤️ Live Data
            </h3>
            <p className="text-gray-600">Tomorrow.io API integration</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              📱 Responsive
            </h3>
            <p className="text-gray-600">Tailwind + modern components</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">⚡ Fast</h3>
            <p className="text-gray-600">Next.js 16 App Router</p>
          </div>
        </div>
      </div>
    </div>
  );
}
