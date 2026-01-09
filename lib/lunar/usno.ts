import { _isoTime } from "better-auth";
import { logit } from "@/lib/log/server";
export interface USNOMoonData {
  moonrise: string | null; // "2026-01-08 16:00:00"
  moonset: string | null; // "2026-01-08 22:00:00"
}
// * Fetch accurate moonrise/moonset from USNO
// * @param latitude number
// * @param longitude number
// * @param date Date (local date)

export async function getUSNOMoonData(
  latitude: number,
  longitude: number,
  date: Date,
): Promise<USNOMoonData> {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const url = `https://api.usno.navy.mil/rstt/oneday?date=${mm}/${dd}/${yyyy}&coords=${latitude},${longitude}&tz=0`;
 await logit({
    level: "info",
    message: "Getting data from USNO",
    file: "lib/lunar/usno.ts",
    line: 22,
    page: "USNO",
    data: {
      url: url,
      yyyy: yyyy,
      mm: mm,
      dd: dd,
    },
  });
  const res = await fetch(url);
  if (!res.ok) {
    console.error("USNO lunar fetch failed", await res.text());
    return { moonrise: null, moonset: null };
  }

  const data = await res.json();
 await logit({
    level: "info",
    message: "Getting data from USNO",
    file: "lib/lunar/usno.ts",
    line: 42,
    page: "USNO",
    data: {
      data: data,
      dd: _isoTime,
    },
  });
  // USNO returns something like:
  // { "moondata": [ { "phen": "R", "time": "16:00" }, { "phen": "S", "time": "22:00" } ] }

  let moonrise: string | null = null;
  let moonset: string | null = null;

  if (Array.isArray(data.moondata)) {
    for (const entry of data.moondata) {
      if (entry.phen === "R" && entry.time !== "") {
        moonrise = `${yyyy}-${mm}-${dd} ${entry.time}:00`;
      }
      if (entry.phen === "S" && entry.time !== "") {
        moonset = `${yyyy}-${mm}-${dd} ${entry.time}:00`;
      }
    }
  }

  return { moonrise, moonset };
}
