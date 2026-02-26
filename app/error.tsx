"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 40 }}>
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <pre>{error.digest}</pre>

      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
