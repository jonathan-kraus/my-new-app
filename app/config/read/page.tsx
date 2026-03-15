import { queryAxiom } from "@/lib/axiom/query";
export const dynamic = "force-dynamic";


export default async function ConfigReadPage() {
    console.log("In config read");
  // Query 1: Flight
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
console.log("QUERY:", qFlight);
  const flightRows = (await queryAxiom(qFlight)) as unknown as Array<{
    Variable01: string
    Variable02: string
    Variable03: string
  }>;

  const flight = flightRows?.[0];

  // Query 2: Weather
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

  const weatherRows = (await queryAxiom(qWeather)) as unknown as Array<{
    Variable01: string
    Variable02: string
    Variable03: string
  }>;

  const weather = weatherRows?.[0];

  return (
    <div className="p-6 space-y-4 text-green-300 text-sm">
      <h1 className="text-xl font-bold mb-4 text-white">Data</h1>

      {flight ? (
        <>
          <div>{flight.Variable01}</div>
          <div>{flight.Variable02}</div>
          <div>{flight.Variable03}</div>
        </>
      ) : (
        <div>No Flight config found.</div>
      )}

      {weather ? (
        <>
          <div>{weather.Variable01}</div>
          <div>{weather.Variable02}</div>
          <div>{weather.Variable03}</div>
        </>
      ) : (
        <div>No Weather config found.</div>
      )}

      <div className="mt-6 text-white">End</div>
    </div>
  );
}
