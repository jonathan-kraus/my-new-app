// app/ping/page.tsx
export default async function PingPage() {
  const res = await fetch("https://www.kraus.my.id/api/ping", {
    cache: "no-store",
  });
  const data = await res.json();

  return (
    <div>
      <h2>Ping API Result:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
