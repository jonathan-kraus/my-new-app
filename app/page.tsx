// app/page.tsx
export default function Dashboard() {
  return (
    <div className="max-w-4xl space-y-6 py-4">
      <div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Weather Dashboard
        </h1>
        <p className="text-2xl text-gray-600 font-medium">
          Real-time forecasts, beautiful UI, and your personal weather hub.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            ☀️
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Live Data</h3>
          <p className="text-gray-600">Tomorrow.io API integration</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            📱
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Responsive</h3>
          <p className="text-gray-600">Tailwind + modern components</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            ⚡
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast</h3>
          <p className="text-gray-600">Next.js 16 App Router</p>
        </div>
      </div>
    </div>
  );
}
