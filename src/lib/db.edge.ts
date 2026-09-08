/*
 * @FilePath: \my-new-app\lib\db.edge.ts
 * @LastEditTime: 2026-05-09 11:35:13
 */
// lib/db.edge.ts
export async function sql<T = any>(query: string, params?: any[]) {
  const url = `${process.env.NEON_DATA_API_URL}/sql`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEON_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql: query,
      params,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Neon Data API error: ${text}`);
  }

  const data = await res.json();
  return data as T;
}
