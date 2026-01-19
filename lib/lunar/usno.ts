// lib/lunar/usno.ts
export interface USNOMoonData {
  moonrise: string;
  moonset: string;
}

export async function getUSNOMoonData(
  latitude: number,
  longitude: number,
  date: Date,
): Promise<USNOMoonData> {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const url = `https://api.usno.navy.mil/rstt/oneday?date=${mm}/${dd}/${yyyy}&coords=${latitude},${longitude}&tz=0`;

  console.log(
    JSON.stringify(
      {
        level: "info",
        message: "Getting data from USNO",
        page: "USNO",
        file: "lib/lunar/usno.ts",
        data: { url, yyyy, mm, dd },
      },
      null,
      2,
    ),
  );

  try {
    const res = await fetch(url);

    console.log(
      JSON.stringify(
        {
          level: "info",
          message: "USNO response meta",
          page: "USNO",
          file: "lib/lunar/usno.ts",
          data: { status: res.status, ok: res.ok },
        },
        null,
        2,
      ),
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "<failed to read body>");
      console.log(
        JSON.stringify(
          {
            level: "error",
            message: "USNO non-OK response",
            page: "USNO",
            file: "lib/lunar/usno.ts",
            data: { status: res.status, body },
          },
          null,
          2,
        ),
      );
      return { moonrise: "", moonset: "" };
    }

    const data = await res.json();

    console.log(
      JSON.stringify(
        {
          level: "info",
          message: "USNO raw JSON",
          page: "USNO",
          file: "lib/lunar/usno.ts",
          data,
        },
        null,
        2,
      ),
    );

    let moonrise: string | null = null;
    let moonset: string | null = null;

    if (Array.isArray(data.moondata)) {
      for (const entry of data.moondata) {
        if (entry.phen === "R" && entry.time) {
          moonrise = `${yyyy}-${mm}-${dd} ${entry.time}:00`;
        }
        if (entry.phen === "S" && entry.time) {
          moonset = `${yyyy}-${mm}-${dd} ${entry.time}:00`;
        }
      }
    }

    console.log(
      JSON.stringify(
        {
          level: "info",
          message: "USNO parsed moon data",
          page: "USNO",
          file: "lib/lunar/usno.ts",
          data: { moonrise, moonset },
        },
        null,
        2,
      ),
    );

    return {
      moonrise: moonrise ?? "",
      moonset: moonset ?? "",
    };
  } catch (err) {
    console.log(
      JSON.stringify(
        {
          level: "error",
          message: "USNO fetch threw",
          page: "USNO",
          file: "lib/lunar/usno.ts",
          data: { error: String(err) },
        },
        null,
        2,
      ),
    );
    return { moonrise: "", moonset: "" };
  }
}
