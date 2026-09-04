"use client";

import { toast } from "react-hot-toast";
import { logj } from "@/lib/log/logj";

export function EmailSideNavLink() {
  async function handleClick() {
    try {
      const res = await fetch("/api/email/test", { method: "POST" });
      const data = await res.json();
      let jei = 0;
      // Log client-side as well (optional but nice)
      logj({
        domain: "email_test_clicked",
        level: "info",
        message: "Email test clicked",
        file: "app/components/sidenav/EmailLink.tsx",
        line: 13,
        payload: { data },
        meta: { built: { eventIndex: ++jei } },
      });

      toast.custom(
        () => (
          <div className="bg-gray-900 text-white p-4 rounded shadow-lg max-w-md">
            <div className="font-semibold mb-2">Email Test Result</div>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
            <button
              className="mt-3 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
              onClick={() => toast.dismiss()}
            >
              Close
            </button>
          </div>
        ),
        { duration: Infinity },
      );
    } catch (err) {
      let jei = 0;
      toast.error("Failed to send test email");
      logj({
        domain: "email_test_error",
        level: "error",
        message: "Failed to send test email",
        file: "app/components/sidenav/EmailLink.tsx",
        line: 43,
        payload: { error: String(err) },
        meta: { built: { eventIndex: ++jei } },
      });
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-gray-300 hover:text-white"
    >
      <span>Email</span>
    </button>
  );
}
