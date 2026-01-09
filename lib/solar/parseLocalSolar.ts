const FALLBACK = "2001-01-01 01:01:01";

export function parseLocalSolar(dateString: string | null | undefined) {
  console.log("parseLocalSolar input:", dateString);
  const safe = dateString ?? FALLBACK;
  const [date, time] = safe.split(" ");
  const [y, m, d] = date.split("-");
  const [hh, mm, ss] = time.split(":");

  return new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    Number(ss)
  );
}
