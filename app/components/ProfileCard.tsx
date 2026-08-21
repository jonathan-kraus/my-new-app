"use client";
// app\components\ProfileCard.tsx
export function ProfileCard({ name, email }: { name: string; email: string }) {
  return (
    <div className="p-4 border-b border-white/10 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">
        👤
      </div>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm opacity-70">{email}</p>
      </div>
    </div>
  );
}
