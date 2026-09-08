// lib/mbta.ts
export async function mbta(path: string, params: Record<string, string> = {}) {
  const url = new URL(`https://api-v3.mbta.com/${path}`);

  // Always include trip so we get headsign + destination
  url.searchParams.set("include", "trip");
  url.searchParams.set("fields[trip]", "headsign,destination");

  // Add user params (like filter[stop])
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      "x-api-key": process.env.MBTA_KEY!,
      "MBTA-Version": "2021-01-09",
    },
    next: { revalidate: 10 },
  });

  console.log("MBTA request:", url.toString(), "Status:", res.status);

  if (!res.ok) throw new Error(`MBTA error: ${res.status}`);
  return res.json();
}
