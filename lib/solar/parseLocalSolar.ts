export function parseLocalSolar(dateString: string | null | undefined) {
  if (!dateString || typeof dateString !== "string") {
    console.error("parseLocalSolar: invalid dateString", dateString);
    return null;
  }

  const [date, time] = dateString.split(" ");
  if (!date || !time) {
    console.error("parseLocalSolar: missing date or time", dateString);
    return null;
  }

  const [y, m, d] = date.split("-");
  const [hh, mm, ss] = time.split(":");

  if (!y || !m || !d || !hh || !mm || !ss) {
    console.error("parseLocalSolar: incomplete timestamp", dateString);
    return null;
  }

  return new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    Number(ss)
  );
}
