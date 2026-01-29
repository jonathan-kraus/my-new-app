"use client";

import { useState } from "react";
import { setConfig, deleteConfig } from "@/lib/runtime/config";

export function ConfigTable({
  configs,
}: {
  configs: { key: string; value: string }[];
}) {
  const [rows, setRows] = useState(configs);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  function detectType(value: string) {
    if (value === "1" || value === "0") return "boolean";
    if (!isNaN(Number(value))) return "number";
    return "string";
  }

  async function update(key: string, value: string) {
    setRows((r) => r.map((x) => (x.key === key ? { ...x, value } : x)));
    await setConfig(key, value);
  }

  async function remove(key: string) {
    setRows((r) => r.filter((x) => x.key !== key));
    await deleteConfig(key);
  }

  async function addNew() {
    if (!newKey.trim()) return;
    const key = newKey.trim();
    const value = newValue.trim() || "0";

    await setConfig(key, value);
    setRows((r) => [...r, { key, value }]);

    setNewKey("");
    setNewValue("");
  }

  return (
    <div className="space-y-6">
      {/* Add New Setting */}
      <div className="p-4 bg-white/5 rounded-lg space-y-3">
        <div className="font-semibold text-white">Add New Setting</div>
        <input
          className="w-full bg-transparent border border-white/20 rounded px-2 py-1"
          placeholder="key (e.g. email.throttle.minutes)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <input
          className="w-full bg-transparent border border-white/20 rounded px-2 py-1"
          placeholder="value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <button
          onClick={addNew}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 text-white"
        >
          Add
        </button>
      </div>

      {/* Existing Settings */}
      {rows.map((row) => {
        const type = detectType(row.value);

        return (
          <div
            key={row.key}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
          >
            <div className="flex-1">
              <div className="font-medium text-white">{row.key}</div>

              {/* Boolean toggle */}
              {type === "boolean" && (
                <button
                  onClick={() => update(row.key, row.value === "1" ? "0" : "1")}
                  className={`mt-1 px-3 py-1 rounded ${
                    row.value === "1" ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {row.value === "1" ? "Enabled" : "Disabled"}
                </button>
              )}

              {/* Number input */}
              {type === "number" && (
                <input
                  type="number"
                  className="mt-1 bg-transparent border border-white/20 rounded px-2 py-1"
                  value={row.value}
                  onChange={(e) => update(row.key, e.target.value)}
                />
              )}

              {/* String input */}
              {type === "string" && (
                <input
                  className="mt-1 bg-transparent border border-white/20 rounded px-2 py-1"
                  value={row.value}
                  onChange={(e) => update(row.key, e.target.value)}
                />
              )}
            </div>

            <button
              onClick={() => remove(row.key)}
              className="ml-4 text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
