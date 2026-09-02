/*
 * @FilePath: \my-new-app\lib\mbta\stops.ts
 */

import type { MBTAStop } from "./types";

export type MBTALineId =
  | "Red"
  | "Mattapan"
  | "Orange"
  | "Blue"
  | "Green-B"
  | "Green-C"
  | "Green-D"
  | "Green-E";

export const lineNames: Record<MBTALineId, string> = {
  Red: "Red Line",
  Mattapan: "Mattapan Trolley",
  Orange: "Orange Line",
  Blue: "Blue Line",
  "Green-B": "Green Line B",
  "Green-C": "Green Line C",
  "Green-D": "Green Line D",
  "Green-E": "Green Line E",
};

/** Red Line stops, in route order. */
export const redStops: MBTAStop[] = [
  { id: "place-alfcl", type: "stop", attributes: { name: "Alewife" } },
  { id: "place-davis", type: "stop", attributes: { name: "Davis" } },
  { id: "place-portr", type: "stop", attributes: { name: "Porter" } },
  { id: "place-harsq", type: "stop", attributes: { name: "Harvard" } },
  { id: "place-cntsq", type: "stop", attributes: { name: "Central" } },
  { id: "place-knncl", type: "stop", attributes: { name: "Kendall/MIT" } },
  { id: "place-chmnl", type: "stop", attributes: { name: "Charles/MGH" } },
  { id: "place-pktrm", type: "stop", attributes: { name: "Park Street" } },
  {
    id: "place-dwnxg",
    type: "stop",
    attributes: { name: "Downtown Crossing" },
  },
  { id: "place-sstat", type: "stop", attributes: { name: "South Station" } },
  { id: "place-brdwy", type: "stop", attributes: { name: "Broadway" } },
  { id: "place-andrw", type: "stop", attributes: { name: "Andrew" } },
  { id: "place-jfk", type: "stop", attributes: { name: "JFK/UMass" } },
  { id: "place-shmnl", type: "stop", attributes: { name: "Savin Hill" } },
  { id: "place-fldcr", type: "stop", attributes: { name: "Fields Corner" } },
  { id: "place-smmnl", type: "stop", attributes: { name: "Shawmut" } },
  { id: "place-asmnl", type: "stop", attributes: { name: "Ashmont" } },
  { id: "place-nqncy", type: "stop", attributes: { name: "North Quincy" } },
  { id: "place-wlsta", type: "stop", attributes: { name: "Wollaston" } },
  { id: "place-qnctr", type: "stop", attributes: { name: "Quincy Center" } },
  { id: "place-qamnl", type: "stop", attributes: { name: "Quincy Adams" } },
  { id: "place-brntn", type: "stop", attributes: { name: "Braintree" } },
];

/** Mattapan Trolley stops, in route order. */
export const mattapanStops: MBTAStop[] = [
  { id: "place-asmnl", type: "stop", attributes: { name: "Ashmont" } },
  { id: "place-cedgr", type: "stop", attributes: { name: "Cedar Grove" } },
  { id: "place-butlr", type: "stop", attributes: { name: "Butler" } },
  { id: "place-miltt", type: "stop", attributes: { name: "Milton" } },
  { id: "place-cenav", type: "stop", attributes: { name: "Central Avenue" } },
  { id: "place-valrd", type: "stop", attributes: { name: "Valley Road" } },
  { id: "place-capst", type: "stop", attributes: { name: "Capen Street" } },
  { id: "place-matt", type: "stop", attributes: { name: "Mattapan" } },
];

/** Orange Line stops, in route order. */
export const orangeStops: MBTAStop[] = [
  { id: "place-forhl", type: "stop", attributes: { name: "Forest Hills" } },
  { id: "place-grnst", type: "stop", attributes: { name: "Green Street" } },
  { id: "place-sbmnl", type: "stop", attributes: { name: "Stony Brook" } },
  { id: "place-jaksn", type: "stop", attributes: { name: "Jackson Square" } },
  { id: "place-rcmnl", type: "stop", attributes: { name: "Roxbury Crossing" } },
  { id: "place-rugg", type: "stop", attributes: { name: "Ruggles" } },
  {
    id: "place-masta",
    type: "stop",
    attributes: { name: "Massachusetts Avenue" },
  },
  { id: "place-bbsta", type: "stop", attributes: { name: "Back Bay" } },
  {
    id: "place-tumnl",
    type: "stop",
    attributes: { name: "Tufts Medical Center" },
  },
  { id: "place-chncl", type: "stop", attributes: { name: "Chinatown" } },
  {
    id: "place-dwnxg",
    type: "stop",
    attributes: { name: "Downtown Crossing" },
  },
  { id: "place-state", type: "stop", attributes: { name: "State" } },
  { id: "place-haecl", type: "stop", attributes: { name: "Haymarket" } },
  { id: "place-north", type: "stop", attributes: { name: "North Station" } },
  {
    id: "place-ccmnl",
    type: "stop",
    attributes: { name: "Community College" },
  },
  { id: "place-sull", type: "stop", attributes: { name: "Sullivan Square" } },
  { id: "place-astao", type: "stop", attributes: { name: "Assembly" } },
  { id: "place-welln", type: "stop", attributes: { name: "Wellington" } },
  { id: "place-mlmnl", type: "stop", attributes: { name: "Malden Center" } },
  { id: "place-ogmnl", type: "stop", attributes: { name: "Oak Grove" } },
];

/** Blue Line stops, in route order. */
export const blueStops: MBTAStop[] = [
  { id: "place-bomnl", type: "stop", attributes: { name: "Bowdoin" } },
  {
    id: "place-gover",
    type: "stop",
    attributes: { name: "Government Center" },
  },
  { id: "place-state", type: "stop", attributes: { name: "State" } },
  { id: "place-aqucl", type: "stop", attributes: { name: "Aquarium" } },
  { id: "place-mvbcl", type: "stop", attributes: { name: "Maverick" } },
  { id: "place-aport", type: "stop", attributes: { name: "Airport" } },
  { id: "place-wimnl", type: "stop", attributes: { name: "Wood Island" } },
  { id: "place-orhte", type: "stop", attributes: { name: "Orient Heights" } },
  { id: "place-sdmnl", type: "stop", attributes: { name: "Suffolk Downs" } },
  { id: "place-bmmnl", type: "stop", attributes: { name: "Beachmont" } },
  { id: "place-rbmnl", type: "stop", attributes: { name: "Revere Beach" } },
  { id: "place-wondl", type: "stop", attributes: { name: "Wonderland" } },
];

/** Green Line B stops, in route order. */
export const greenBStops: MBTAStop[] = [
  {
    id: "place-gover",
    type: "stop",
    attributes: { name: "Government Center" },
  },
  { id: "place-pktrm", type: "stop", attributes: { name: "Park Street" } },
  { id: "place-boyls", type: "stop", attributes: { name: "Boylston" } },
  { id: "place-armnl", type: "stop", attributes: { name: "Arlington" } },
  { id: "place-coecl", type: "stop", attributes: { name: "Copley" } },
  {
    id: "place-hymnl",
    type: "stop",
    attributes: { name: "Hynes Convention Center" },
  },
  { id: "place-kencl", type: "stop", attributes: { name: "Kenmore" } },
  { id: "place-bland", type: "stop", attributes: { name: "Blandford Street" } },
  {
    id: "place-buest",
    type: "stop",
    attributes: { name: "Boston University East" },
  },
  {
    id: "place-bucen",
    type: "stop",
    attributes: { name: "Boston University Central" },
  },
  { id: "place-amory", type: "stop", attributes: { name: "Amory Street" } },
  { id: "place-babck", type: "stop", attributes: { name: "Babcock Street" } },
  { id: "place-brico", type: "stop", attributes: { name: "Packard's Corner" } },
  { id: "place-harvd", type: "stop", attributes: { name: "Harvard Avenue" } },
  { id: "place-grigg", type: "stop", attributes: { name: "Griggs Street" } },
  { id: "place-alsgr", type: "stop", attributes: { name: "Allston Street" } },
  { id: "place-wrnst", type: "stop", attributes: { name: "Warren Street" } },
  {
    id: "place-wascm",
    type: "stop",
    attributes: { name: "Washington Street" },
  },
  { id: "place-sthld", type: "stop", attributes: { name: "Sutherland Road" } },
  { id: "place-chswk", type: "stop", attributes: { name: "Chiswick Road" } },
  {
    id: "place-chill",
    type: "stop",
    attributes: { name: "Chestnut Hill Avenue" },
  },
  { id: "place-sougr", type: "stop", attributes: { name: "South Street" } },
  { id: "place-lake", type: "stop", attributes: { name: "Boston College" } },
];

/** Green Line C stops, in route order. */
export const greenCStops: MBTAStop[] = [
  { id: "place-clmnl", type: "stop", attributes: { name: "Cleveland Circle" } },
  { id: "place-engav", type: "stop", attributes: { name: "Englewood Avenue" } },
  { id: "place-denrd", type: "stop", attributes: { name: "Dean Road" } },
  { id: "place-tapst", type: "stop", attributes: { name: "Tappan Street" } },
  {
    id: "place-bcnwa",
    type: "stop",
    attributes: { name: "Washington Square" },
  },
  { id: "place-fbkst", type: "stop", attributes: { name: "Fairbanks Street" } },
  { id: "place-bndhl", type: "stop", attributes: { name: "Brandon Hall" } },
  { id: "place-sumav", type: "stop", attributes: { name: "Summit Avenue" } },
  { id: "place-cool", type: "stop", attributes: { name: "Coolidge Corner" } },
  {
    id: "place-stpul",
    type: "stop",
    attributes: { name: "Saint Paul Street" },
  },
  { id: "place-kntst", type: "stop", attributes: { name: "Kent Street" } },
  { id: "place-hwsst", type: "stop", attributes: { name: "Hawes Street" } },
  {
    id: "place-smary",
    type: "stop",
    attributes: { name: "Saint Mary's Street" },
  },
  { id: "place-kencl", type: "stop", attributes: { name: "Kenmore" } },
  {
    id: "place-hymnl",
    type: "stop",
    attributes: { name: "Hynes Convention Center" },
  },
  { id: "place-coecl", type: "stop", attributes: { name: "Copley" } },
  { id: "place-armnl", type: "stop", attributes: { name: "Arlington" } },
  { id: "place-boyls", type: "stop", attributes: { name: "Boylston" } },
  { id: "place-pktrm", type: "stop", attributes: { name: "Park Street" } },
  {
    id: "place-gover",
    type: "stop",
    attributes: { name: "Government Center" },
  },
];

/** Green Line D stops, in route order. */
export const greenDStops: MBTAStop[] = [
  { id: "place-river", type: "stop", attributes: { name: "Riverside" } },
  { id: "place-woodl", type: "stop", attributes: { name: "Woodland" } },
  { id: "place-waban", type: "stop", attributes: { name: "Waban" } },
  { id: "place-eliot", type: "stop", attributes: { name: "Eliot" } },
  { id: "place-newtn", type: "stop", attributes: { name: "Newton Highlands" } },
  { id: "place-newto", type: "stop", attributes: { name: "Newton Centre" } },
  { id: "place-chhil", type: "stop", attributes: { name: "Chestnut Hill" } },
  { id: "place-rsmnl", type: "stop", attributes: { name: "Reservoir" } },
  { id: "place-bcnfd", type: "stop", attributes: { name: "Beaconsfield" } },
  { id: "place-brkhl", type: "stop", attributes: { name: "Brookline Hills" } },
  {
    id: "place-bvmnl",
    type: "stop",
    attributes: { name: "Brookline Village" },
  },
  { id: "place-longw", type: "stop", attributes: { name: "Longwood" } },
  { id: "place-fenwy", type: "stop", attributes: { name: "Fenway" } },
  { id: "place-kencl", type: "stop", attributes: { name: "Kenmore" } },
  {
    id: "place-hymnl",
    type: "stop",
    attributes: { name: "Hynes Convention Center" },
  },
  { id: "place-coecl", type: "stop", attributes: { name: "Copley" } },
  { id: "place-armnl", type: "stop", attributes: { name: "Arlington" } },
  { id: "place-boyls", type: "stop", attributes: { name: "Boylston" } },
  { id: "place-pktrm", type: "stop", attributes: { name: "Park Street" } },
  {
    id: "place-gover",
    type: "stop",
    attributes: { name: "Government Center" },
  },
  { id: "place-haecl", type: "stop", attributes: { name: "Haymarket" } },
  { id: "place-north", type: "stop", attributes: { name: "North Station" } },
  {
    id: "place-spmnl",
    type: "stop",
    attributes: { name: "Science Park/West End" },
  },
  { id: "place-lech", type: "stop", attributes: { name: "Lechmere" } },
  { id: "place-unsqu", type: "stop", attributes: { name: "Union Square" } },
];

/** Green Line E stops, in route order. */
export const greenEStops: MBTAStop[] = [
  { id: "place-hsmnl", type: "stop", attributes: { name: "Heath Street" } },
  { id: "place-bckhl", type: "stop", attributes: { name: "Back of the Hill" } },
  { id: "place-rvrwy", type: "stop", attributes: { name: "Riverway" } },
  { id: "place-mispk", type: "stop", attributes: { name: "Mission Park" } },
  { id: "place-fenwd", type: "stop", attributes: { name: "Fenwood Road" } },
  { id: "place-brmnl", type: "stop", attributes: { name: "Brigham Circle" } },
  { id: "place-lngmd", type: "stop", attributes: { name: "Longwood Medical Area" } },
  { id: "place-mfa",   type: "stop", attributes: { name: "Museum of Fine Arts" } },
  { id: "place-nuniv", type: "stop", attributes: { name: "Northeastern University" } },
  { id: "place-symcl", type: "stop", attributes: { name: "Symphony" } },
  { id: "place-prmnl", type: "stop", attributes: { name: "Prudential" } },
  { id: "place-coecl", type: "stop", attributes: { name: "Copley" } },
  { id: "place-armnl", type: "stop", attributes: { name: "Arlington" } },
  { id: "place-boyls", type: "stop", attributes: { name: "Boylston" } },
  { id: "place-pktrm", type: "stop", attributes: { name: "Park Street" } },
  { id: "place-gover", type: "stop", attributes: { name: "Government Center" } },
  { id: "place-haecl", type: "stop", attributes: { name: "Haymarket" } },
  { id: "place-north", type: "stop", attributes: { name: "North Station" } },
  { id: "place-spmnl", type: "stop", attributes: { name: "Science Park/West End" } },
  { id: "place-lech", type: "stop", attributes: { name: "Lechmere" } },
  { id: "place-esomr", type: "stop", attributes: { name: "East Somerville" } },
  { id: "place-gilmn", type: "stop", attributes: { name: "Gilman Square" } },
  { id: "place-mgngl", type: "stop", attributes: { name: "Magoun Square" } },
  { id: "place-balsq", type: "stop", attributes: { name: "Ball Square" } },
  { id: "place-mdftf", type: "stop", attributes: { name: "Medford/Tufts" } },
];

export const stopsByLine: Record<MBTALineId, MBTAStop[]> = {
  Red: redStops,
  Mattapan: mattapanStops,
  Orange: orangeStops,
  Blue: blueStops,
  "Green-B": greenBStops,
  "Green-C": greenCStops,
  "Green-D": greenDStops,
  "Green-E": greenEStops,
};

export const allStops: MBTAStop[] = Object.values(stopsByLine)
  .flat()
  .filter(
    (stop, index, stops) =>
      stops.findIndex((other) => other.id === stop.id) === index,
  );

export const linesByStopId: Record<string, MBTALineId[]> = Object.entries(
  stopsByLine,
).reduce<Record<string, MBTALineId[]>>((acc, [line, stops]) => {
  for (const stop of stops) {
    (acc[stop.id] ??= []).push(line as MBTALineId);
  }
  return acc;
}, {});

export function getStopName(stopId: string) {
  const stop = allStops.find((s) => s.id === stopId);
  return stop?.attributes?.name ?? stopId;
}
