"use client";

import type { ErrorInfo } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body>
        <pre>{error.message}</pre>
        <pre>{error.digest}</pre>
      </body>
    </html>
  );
}
