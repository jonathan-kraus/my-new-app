// lib/solar/parseLocalSolar.ts
export function parseLocalSolar(dateString: string) {
  const [date, time] = dateString.split(" ");
  const [y, m, d] = date.split("-");
  const [hh, mm, ss] = time.split(":");

  return new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    Number(ss ?? 0),
  );
}
