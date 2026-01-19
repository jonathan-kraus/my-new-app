// app/ping/page.tsx

export default async function AxiomTestPage() {
  const res = await fetch("https://www.kraus.my.id/api/ping", {
    cache: "no-store",
  });

  const data = await res.json();
  const rows = data.rows ?? []; // astronomy rows from your API

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold mb-4">Result</h1>

      {/* Raw JSON (debug) */}
      <pre className="bg-black/40 p-4 rounded text-green-300 text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>

      {/* Render Astronomy Data */}
      <div className="space-y-4">
        {rows.map((row: any, i: number) => (
          <div
            key={row._rowId ?? i}
            className="p-4 rounded-lg bg-blue-900/40 border border-blue-700"
          >
            <div className="font-semibold text-blue-200">
              Snapshot at {row._time}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div>A: {row.data?.dataj_sunrisea}</div>
              <div>B: {row.data?.dataj_sunriseb}</div>
              <div>C: {row.data?.dataj_sunrisec}</div>
              <div>D: {row.data?.dataj_sunrised}</div>
              <div>E: {row.data?.dataj_sunrisee}</div>
              <div>F: {row.data?.dataj_sunrisef}</div>
              <div>G: {row.data?.dataj_sunriseg}</div>
              <div>Fetched: {row.data?.dataj_fetchedAt}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
