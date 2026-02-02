"use client";

import { useState } from "react";

export default function LogRow({ log }: { log: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="p-2 text-gray-600">
          {new Date(log.dataj.timestamp).toLocaleTimeString()}
        </td>

        <td className="p-2">
          <span
            className="px-2 py-1 rounded text-white text-xs"
            style={{ backgroundColor: colorForDomain(log.domain) }}
          >
            {log.domain}
          </span>
        </td>

        <td className="p-2">{log.message}</td>

        <td className="p-2">
          <button
            onClick={() => setOpen(!open)}
            className="text-blue-600 hover:underline"
          >
            {open ? "Hide" : "Show"}
          </button>
        </td>
      </tr>

      {open && (
        <tr className="bg-gray-50 border-b">
          <td colSpan={4} className="p-4">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(log, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}

function colorForDomain(domain: string) {
  switch (domain) {
    case "notes":
      return "#2563eb"; // blue
    case "auth":
      return "#16a34a"; // green
    case "email":
      return "#d97706"; // amber
    default:
      return "#6b7280"; // gray
  }
}
