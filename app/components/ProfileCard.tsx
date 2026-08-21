"use client";

export function ProfileCard({
  name,
  email,
  id,
  expires,
  image,
}: {
  name?: string | null;
  email?: string | null;
  id?: string | null;
  expires?: string | null;
  image?: string | null;
}) {
  return (
    <div className="p-5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.25)] flex items-center gap-4">
      <img
        src={image ?? "/default-avatar.png"}
        alt="avatar"
        className="w-14 h-14 rounded-full object-cover border border-white/20"
      />

      <div className="flex flex-col">
        <p className="font-semibold text-white">{name ?? "Unknown user"}</p>
        <p className="text-sm text-white/70">{email ?? "No email"}</p>

        {id && <p className="text-xs text-white/40 mt-1">User ID: {id}</p>}

        {expires && (
          <span className="mt-2 inline-block text-xs px-2 py-1 rounded bg-white/10 border border-white/20 text-white/70">
            Expires: {expires}
          </span>
        )}
      </div>
    </div>
  );
}
