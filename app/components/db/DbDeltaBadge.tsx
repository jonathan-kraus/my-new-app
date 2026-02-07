// components/db/DbDeltaBadge.tsx
export function DbDeltaBadge({ delta }: { delta: number }) {
  const positive = delta > 0;
  const negative = delta < 0;

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        positive
          ? "bg-green-100 text-green-700"
          : negative
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-600"
      }`}
    >
      {positive && "+"}
      {delta} rows
    </span>
  );
}
