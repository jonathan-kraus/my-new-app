export function parseLocalSolar(dateString: unknown): Date {
  const safe =
    typeof dateString === "string" && dateString.includes(" ")
      ? dateString
      : "2001-01-01 01:01:01";

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
