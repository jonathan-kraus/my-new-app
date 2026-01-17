// app/ping/page.tsx

export default async function AxiomTestPage() {
  const res = await fetch("https://www.kraus.my.id/api/ping", {
    cache: "no-store",
  });

  const data = await res.json();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Result</h1>

      <pre className="bg-black/40 p-4 rounded text-green-300 text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
