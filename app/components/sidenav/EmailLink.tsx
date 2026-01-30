"use client";

import { toast } from "sonner";
import { logit } from "@/lib/logging/logit";

export function EmailSideNavLink() {
  async function handleClick() {
    try {
      const res = await fetch("/api/email/test", { method: "POST" });
      const data = await res.json();

      // Log client-side as well (optional but nice)
      logit("email_test_clicked", { data });

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
        { duration: Infinity }
      );
    } catch (err) {
      toast.error("Failed to send test email");
      logit("email_test_error", { error: String(err) });
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
