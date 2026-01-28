"use client";

import { useState } from "react";
import { setConfig, deleteConfig } from "@/lib/runtime/config";

export function ConfigTable({
  configs,
}: {
  configs: { key: string; value: string }[];
}) {
  const [rows, setRows] = useState(configs);

  async function update(key: string, value: string) {
    setRows((r) => r.map((x) => (x.key === key ? { ...x, value } : x)));
    await setConfig(key, value);
  }

  async function remove(key: string) {
    setRows((r) => r.filter((x) => x.key !== key));
    await deleteConfig(key);
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
        >
          <div>
            <div className="font-medium">{row.key}</div>
            <input
              className="mt-1 bg-transparent border border-white/20 rounded px-2 py-1"
              value={row.value}
              onChange={(e) => update(row.key, e.target.value)}
            />
          </div>

          <button
            onClick={() => remove(row.key)}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
