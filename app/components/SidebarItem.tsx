import Link from "next/link";
// app\components\SidebarItem.tsx
export function SidebarItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-3 px-4 py-2 rounded-md font-medium
        transition-all duration-300 ease-out
        ${
          active
            ? "text-blue-600 bg-blue-600/10 shadow-[inset_0_0_8px_rgba(37,99,235,0.25)]"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:-translate-y-[1px]"
        }
      `}
    >
      <span
        className={`
          absolute left-0 top-0 h-full w-1 rounded-r-md bg-blue-600
          transition-all duration-300 ease-out
          ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}
        `}
      />
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}
