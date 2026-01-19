// app/profile/page.tsx
export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <p className="text-gray-600">Your profile page content goes here.</p>
        <p className="text-sm text-gray-500 mt-4">
          Profile data will be available via `useSession()` in client
          components.
        </p>
      </div>
    </div>
  );
}
