"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createRuntimeSetting,
  deleteRuntimeSetting,
  saveRuntimeSetting,
} from "@/lib/runtime/actions";
import { runtimeSettingSchema } from "@/lib/runtime/validation";
import type { RuntimeSetting } from "@/lib/runtime/validation";

export function ConfigTable({ configs }: { configs: RuntimeSetting[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(configs);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const hasDrafts = rows.some(
    (row) => (drafts[row.key] ?? row.value) !== row.value,
  );
  const hasUnsavedChanges = hasDrafts || newKey !== "" || newValue !== "";

  async function run(operation: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    setStatus("");
    try {
      await operation();
    } catch (err) {
      console.error("Runtime settings request failed", err);
      setError(
        "The request failed. Your edits are still here; please try again.",
      );
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  async function save(key: string, value: string, creating = false) {
    const parsed = runtimeSettingSchema.safeParse({ key, value });
    if (!parsed.success) {
      setError(parsed.error.issues[0]!.message);
      return;
    }
    if (creating && rows.some((row) => row.key === parsed.data.key)) {
      setError("That setting already exists. Edit its existing row.");
      return;
    }
    await run(async () => {
      const result = await (
        creating ? createRuntimeSetting : saveRuntimeSetting
      )(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRows((current) =>
        creating
          ? [...current, parsed.data].sort((a, b) => a.key.localeCompare(b.key))
          : current.map((row) => (row.key === key ? parsed.data : row)),
      );
      setDrafts((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      if (creating) {
        setNewKey("");
        setNewValue("");
      }
      setStatus("Saved " + parsed.data.key + ".");
      router.refresh();
    });
  }

  async function remove(key: string) {
    await run(async () => {
      const result = await deleteRuntimeSetting(key);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRows((current) => current.filter((row) => row.key !== key));
      setDrafts((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      setStatus("Deleted " + key + ".");
      router.refresh();
    });
  }

  async function refresh() {
    if (hasUnsavedChanges) return;
    await run(async () => {
      const res = await fetch("/api/admin/runtime", { cache: "no-store" });
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Please sign in to manage settings."
            : res.status === 403
              ? "Administrator access is required."
              : "Could not refresh settings. Please try again.",
        );
        return;
      }
      const data = await res.json();
      setRows(data.configs);
      setDrafts({});
      setStatus("Settings refreshed.");
      router.refresh();
    });
  }

  const buttonClass =
    "rounded px-3 py-1 text-white disabled:opacity-50 disabled:cursor-not-allowed";
  return (
    <div className="space-y-6" aria-busy={pending}>
      {error && (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      )}
      <p role="status" className="text-green-400">
        {pending ? "Working..." : status}
      </p>
      <fieldset disabled={pending} className="space-y-6">
        <form
          className="space-y-3 rounded-lg bg-white/5 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void save(newKey, newValue, true);
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Add New Setting</h2>
            <button
              type="button"
              onClick={refresh}
              disabled={pending || hasUnsavedChanges}
              className={buttonClass + " bg-gray-700"}
            >
              Refresh
            </button>
          </div>
          <label className="block text-white">
            Key
            <input
              required
              maxLength={200}
              className="block w-full rounded border border-white/20 bg-transparent p-2"
              placeholder="e.g. email.throttle.minutes"
              value={newKey}
              onChange={(event) => setNewKey(event.target.value)}
            />
          </label>
          <label className="block text-white">
            Value
            <input
              required
              maxLength={10_000}
              className="block w-full rounded border border-white/20 bg-transparent p-2"
              value={newValue}
              onChange={(event) => setNewValue(event.target.value)}
            />
          </label>
          <button type="submit" className={buttonClass + " bg-blue-600"}>
            Add setting
          </button>
          <button
            type="button"
            className={buttonClass + " bg-gray-700"}
            disabled={pending || (!newKey && !newValue)}
            onClick={() => {
              setNewKey("");
              setNewValue("");
            }}
          >
            Discard
          </button>
        </form>
        {hasUnsavedChanges && (
          <p className="text-amber-300">
            You have unsaved changes. Save or discard them before refreshing.
          </p>
        )}
        {rows.map((row) => {
          const value = drafts[row.key] ?? row.value;
          const dirty = value !== row.value;
          return (
            <form
              key={row.key}
              className="flex flex-wrap items-end gap-3 rounded-lg bg-white/5 p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void save(row.key, value);
              }}
            >
              <label className="min-w-0 flex-1 font-medium text-white">
                {row.key}
                <input
                  required
                  maxLength={10_000}
                  className="mt-1 block w-full rounded border border-white/20 bg-transparent p-2"
                  value={value}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [row.key]: event.target.value,
                    }))
                  }
                />
                {dirty && (
                  <span className="text-sm text-amber-300">Unsaved</span>
                )}
              </label>
              <button
                type="submit"
                disabled={pending || !dirty}
                className={buttonClass + " bg-blue-600"}
              >
                Save
              </button>
              <button
                type="button"
                disabled={pending || !dirty}
                className={buttonClass + " bg-gray-700"}
                onClick={() =>
                  setDrafts((current) => ({ ...current, [row.key]: row.value }))
                }
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => remove(row.key)}
                className={buttonClass + " bg-red-800"}
              >
                Delete
              </button>
            </form>
          );
        })}
      </fieldset>
    </div>
  );
}
