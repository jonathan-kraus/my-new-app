/*
 * @FilePath: \my-new-app\app\forecast\getCurrentTemp.ts
 * @LastEditTime: 2026-07-19 21:08:35
 */
// app/forecast/getCurrentTemp.ts
export async function getCurrentTemp() {
  const lat = 40.0894;
  const lon = -75.396;

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`,
    { next: { revalidate: 0 } },
  );

  const data = await res.json();
  const celsius = data.current.temperature_2m;
  return Math.round((celsius * 9) / 5 + 32);
}
