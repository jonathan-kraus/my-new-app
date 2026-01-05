"use client";

import { useState } from "react";
import {
  updateConfig,
  deleteConfig,
  createConfig,
} from "@/app/admin/runtime/action";
type ConfigTableProps = { configs: { key: string; value: string }[] };
export default function ConfigTable({ configs }: ConfigTableProps) {
  const [rows, setRows] = useState(configs);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  async function handleUpdate(key: string, value: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, value } : r)));
    await updateConfig(key, value);
  }

  async function handleDelete(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
    await deleteConfig(key);
  }

  async function handleCreate() {
    await createConfig(newKey, newValue);
    setRows((prev) => [...prev, { key: newKey, value: newValue }]);
    setNewKey("");
    setNewValue("");
  }

  return (
    <div className="bg-white/10 p-4 rounded-xl border border-white/20">
      <table className="w-full text-white">
        <thead>
          <tr className="text-left text-sky-300">
            <th className="py-2">Key</th>
            <th className="py-2">Value</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-white/10">
              <td className="py-2">{row.key}</td>
              <td className="py-2">
                <input
                  className="bg-white/20 px-2 py-1 rounded"
                  value={row.value}
                  onChange={(e) => handleUpdate(row.key, e.target.value)}
                />
              </td>
              <td>
                <button
                  onClick={() => handleDelete(row.key)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* Add new row */}
          <tr className="border-t border-white/10">
            <td className="py-2">
              <input
                className="bg-white/20 px-2 py-1 rounded"
                placeholder="new.key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </td>
            <td className="py-2">
              <input
                className="bg-white/20 px-2 py-1 rounded"
                placeholder="value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </td>
            <td>
              <button
                onClick={handleCreate}
                className="text-green-400 hover:text-green-300"
              >
                Add
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
