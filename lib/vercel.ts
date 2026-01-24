// lib/vercel.ts
export async function vercelRequest<T>(path: string, params?: Record<string, string>) {
  const url = new URL(`https://api.vercel.com${path}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
    },
    cache: "no-store",
  });

  const json = await res.json();

  console.log(`[VERCEL RAW] ${path}`, JSON.stringify(json, null, 2));

  return json as T;
}
