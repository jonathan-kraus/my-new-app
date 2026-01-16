"use client";

import { useState } from "react";
import { updateConfig, deleteConfig, createConfig } from "@/app/admin/runtime/action";
import { useToast } from "@/components/Toast";

export function RuntimeConfigClient({ configs }) {
  const [items, setItems] = useState(configs);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const toast = useToast();

  async function handleUpdate(key, value) {
    const prev = [...items];
    setItems((i) => i.map((c) => (c.key === key ? { ...c, value } : c)));

    try {
      await updateConfig(key, value);
      toast.show("Updated!", "info");
    } catch (err) {
      setItems(prev);
      toast.show("Update failed", "error");
    }
  }

  async function handleDelete(key) {
    const prev = [...items];
    setItems((i) => i.filter((c) => c.key !== key));

    try {
      await deleteConfig(key);
      toast.show("Deleted!", "info");
    } catch (err) {
      setItems(prev);
      toast.show("Delete failed", "error");
    }
  }

  async function handleCreate() {
    if (!newKey.trim()) return;

    const newItem = { key: newKey, value: newValue };
    const prev = [...items];
    setItems((i) => [...i, newItem]);

    try {
      await createConfig(newKey, newValue);
      toast.show("Created!", "info");
    } catch (err) {
      setItems(prev);
      toast.show("Create failed", "error");
    }

    setNewKey("");
    setNewValue("");
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8 text-white">
      <h1 className="text-3xl font-bold">Runtime Configuration</h1>

      {/* Add new key */}
      <div className="border border-white/20 rounded-lg p-4 space-y-3">
        <h2 className="text-xl font-semibold">Add New Config</h2>

        <div className="flex gap-3">
          <input
            className="flex-1 bg-black/20 border border-white/20 rounded px-3 py-2"
            placeholder="key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            className="flex-1 bg-black/20 border border-white/20 rounded px-3 py-2"
            placeholder="value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button
            onClick={handleCreate}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Existing configs */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="border border-white/20 rounded-lg p-4 flex items-center gap-4"
          >
            <div className="flex-1">
              <div className="font-semibold">{item.key}</div>
              <input
                className="mt-1 w-full bg-black/20 border border-white/20 rounded px-3 py-2"
                value={item.value}
                onChange={(e) => handleUpdate(item.key, e.target.value)}
              />
            </div>

            <button
              onClick={() => handleDelete(item.key)}
              className="bg-red-600 px-3 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
