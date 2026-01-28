"use client";
// app/errors.tsx

import { useEffect } from "react";
import { useLogger } from "next-axiom";
import { usePathname } from "next/navigation";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const log = useLogger({ source: "app/error.tsx" });

  useEffect(() => {
    log.error("Unhandled error", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      digest: error.digest,
      path: pathname,
      url: window.location.href,
    });
  }, [error, pathname, log]);

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">
        Oops! Something went wrong.
      </h1>
      <p className="text-red-400 px-8 py-2 text-lg">{error.message}</p>

      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
