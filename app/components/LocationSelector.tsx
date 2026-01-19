"use client";
import { Location } from "@/lib/types";

export function LocationSelector({
  locations,
  selectedId,
  onChange,
}: {
  locations: Location[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  return (
    <select
      value={selectedId}
      onChange={(e) => onChange(e.target.value)}
      className=" rounded-lg px-3 py-2 bg-white/90 backdrop-blur border border-blue/60 shadow text-gray-900 font-medium "
    >
      {locations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
        </option>
      ))}
    </select>
  );
}
