import { queryAxiom } from "@/lib/axiom/query";
import { logit } from "@/lib/log/logit";

export const dynamic = "force-dynamic";

export default async function ConfigReadPage() {
  console.log("=== PAGE START ===");
   await logit(
    "jonathan",
    {
      level: "info",
      message: "PAGE START",
    },
    {

          },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );

  // -----------------------------
  // Query 1: Flight
  // -----------------------------
  const qFlight = `
  from "github-events"
| where reason == "Flight"
| sort by _time desc
| project
    Variable01 = firstData.Variable01,
    Variable02 = firstData.Variable02,
    Variable03 = firstData.Variable03
| take 1
`;

  console.log("FLIGHT QUERY STRING:", qFlight);

 await logit(
    "jonathan",
    {
      level: "info",
      message: "FLIGHT QUERY STRING",
    },
    {
      flightQuery: qFlight,
          },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  console.log("ABOUT TO QUERY AXIOM (FLIGHT)");

 await logit(
    "jonathan",
    {
      level: "info",
      message: "about to query axiom (flight)",
    },
    {

          },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  let flightRows: any = [];
  try {
    flightRows = await queryAxiom(qFlight, 999930, "github-events");
    console.log("AFTER QUERY AXIOM (FLIGHT)");
    console.log("FLIGHT ROWS:", flightRows);

     await logit(
    "jonathan",
    {
      level: "info",
      message: "after query axiom (flight)",
    },
    {
      weatherQuery: flightRows,
          },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  } catch (err) {
    console.log("ERROR QUERYING AXIOM (FLIGHT):", err);
    await logit("jonathan",
      {
      level:"info",
      message: "ERROR QUERYING AXIOM (FLIGHT)",  err,
    },
    {},
  {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );

  const flight = flightRows?.[0];
  console.log("FLIGHT DATA:", flight);

  await logit(
    "jonathan",
    {
      level: "info",
      message: "Flight data",
    },
    {
flightQuery: flight,
    },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  // -----------------------------
  // Query 2: Weather
  // -----------------------------
  const qWeather = `
  from github-events
| where reason == "Weather"
| sort by _time desc
| project
    Variable01 = secondData.Variable01,
    Variable02 = secondData.Variable02,
    Variable03 = secondData.Variable03
| take 1
`;

  console.log("WEATHER QUERY STRING:", qWeather);
    await logit(
    "jonathan",
    {
      level: "info",
      message: "WEATHER QUERY STRING",
    },
    {
      weatherQuery: qWeather,
          },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );


  console.log("ABOUT TO QUERY AXIOM (WEATHER)");

 await logit(
    "jonathan",
    {
      level: "info",
      message: "ABOUT TO QUERY AXIOM (WEATHER)",
    },
    {

          },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  let weatherRows: any = [];
  try {
    weatherRows = await queryAxiom(qWeather, 999930, "github-events");
    console.log("AFTER QUERY AXIOM (WEATHER)");
    console.log("WEATHER ROWS:", weatherRows);

     await logit(
    "jonathan",
    {
      level: "info",
      message: "AFTER QUERY AXIOM (WEATHER)",
    },
    {
      weatherRows: weatherRows,
          },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  } catch (err) {
    console.log("ERROR QUERYING AXIOM (WEATHER):", err);

 await logit(
    "jonathan",
    {
      level: "info",
      message: "ERROR QUERYING AXIOM (WEATHER)",
    },
    {
      err: err,
          },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
  const weather = weatherRows?.[0];
  console.log("WEATHER DATA:", weather);

   await logit(
    "jonathan",
    {
      level: "info",
      message: "WEATHER DATA",
    },
    {
      weatherQuery: weather,
          },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );

  console.log("=== PAGE END ===");
   await logit(
    "jonathan",
    {
      level: "info",
      message: "PAGE END",
    },
    {

          },
    {

      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );

  // -----------------------------
  // Render raw data for debugging
  // -----------------------------
  return (
    <div className="p-6 space-y-4 text-green-300 text-sm">
      <h1 className="text-xl font-bold mb-4 text-white">Data</h1>

      <pre className="text-white text-xs bg-black/40 p-4 rounded">
        {JSON.stringify({ flightRows, weatherRows }, null, 2)}
      </pre>

      <div className="mt-6 text-white">End</div>
    </div>
  );
}
}
}
