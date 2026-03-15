import { queryAxiom } from "@/lib/axiom/query";
import { logit } from "@/lib/log/logit";

export const dynamic = "force-dynamic";

export default async function ConfigReadPage() {
  console.log("=== PAGE START ===");
  await logit("info", "config-read", "PAGE START");

  // -----------------------------
  // Query 1: Flight
  // -----------------------------
  const qFlight = `
['github-events']
| where reason == "Flight"
| sort by _time desc
| project
    Variable01 = firstData.Variable01,
    Variable02 = firstData.Variable02,
    Variable03 = firstData.Variable03
| take 1
`;

  console.log("FLIGHT QUERY STRING:", qFlight);
  await logit("info", "config-read", "FLIGHT QUERY STRING", { qFlight });

  console.log("ABOUT TO QUERY AXIOM (FLIGHT)");
  await logit("info", "config-read", "ABOUT TO QUERY AXIOM (FLIGHT)");

  let flightRows: any = [];
  try {
    flightRows = await queryAxiom(qFlight);
    console.log("AFTER QUERY AXIOM (FLIGHT)");
    console.log("FLIGHT ROWS:", flightRows);
    await logit("info", "config-read", "AFTER QUERY AXIOM (FLIGHT)", {
      flightRows,
    });
  } catch (err) {
    console.log("ERROR QUERYING AXIOM (FLIGHT):", err);
    await logit("error", "config-read", "ERROR QUERYING AXIOM (FLIGHT)", {
      err,
    });
  }

  const flight = flightRows?.[0];
  console.log("FLIGHT DATA:", flight);
  await logit("info", "config-read", "FLIGHT DATA", { flight });

  // -----------------------------
  // Query 2: Weather
  // -----------------------------
  const qWeather = `
['github-events']
| where reason == "Weather"
| sort by _time desc
| project
    Variable01 = secondData.Variable01,
    Variable02 = secondData.Variable02,
    Variable03 = secondData.Variable03
| take 1
`;

  console.log("WEATHER QUERY STRING:", qWeather);
  await logit("info", "config-read", "WEATHER QUERY STRING", { qWeather });

  console.log("ABOUT TO QUERY AXIOM (WEATHER)");
  await logit("info", "config-read", "ABOUT TO QUERY AXIOM (WEATHER)");

  let weatherRows: any = [];
  try {
    weatherRows = await queryAxiom(qWeather);
    console.log("AFTER QUERY AXIOM (WEATHER)");
    console.log("WEATHER ROWS:", weatherRows);
    await logit("info", "config-read", "AFTER QUERY AXIOM (WEATHER)", {
      weatherRows,
    });
  } catch (err) {
    console.log("ERROR QUERYING AXIOM (WEATHER):", err);
    await logit("error", "config-read", "ERROR QUERYING AXIOM (WEATHER)", {
      err,
    });
  }

  const weather = weatherRows?.[0];
  console.log("WEATHER DATA:", weather);
  await logit("info", "config-read", "WEATHER DATA", { weather });

  console.log("=== PAGE END ===");
  await logit("info", "config-read", "PAGE END");

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
