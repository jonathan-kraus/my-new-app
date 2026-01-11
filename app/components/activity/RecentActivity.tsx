"use client";

import { useEffect, useState } from "react";

export function RecentActivity() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/activity/github");
        const data = await res.json();

        const safe = Array.isArray(data) ? data : [];

        const normalized = safe.map((d: any) => ({
          id: d.id,
          type: "github",
          name: d.name,
          status: d.status,
          conclusion: d.conclusion,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          repo: d.repo,
        }));

        setItems(normalized);
      } catch {
        setItems([]);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-md border p-3 bg-white shadow-sm"
        >
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-600">
            {item.status} → {item.conclusion}
          </div>
          <div className="text-xs text-gray-400">{item.repo}</div>
        </div>
      ))}
    </div>
  );
}
