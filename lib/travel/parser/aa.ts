import * as cheerio from "cheerio";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { buildTestEmail } from "../../buildTestEmail";

// -----------------------------
// TYPES
// -----------------------------
export type ParsedPassenger = {
  name: string;
};

export type ParsedPayment = {
  label: string;
  amount: string;
};

export type ParsedBag = {
  description: string;
  price?: string;
};

export type ParsedSegment = {
  date: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;
  flightNumber: string;
  operatedBy: string;
  seats: string[];
};

export type ParsedTravelSnapshot = {
  source: "AA_EMAIL";
  receivedAt: Date;
  confirmationCode: string;
  issuedDate: string;
  rawHtml: string;
  passengers: ParsedPassenger[];
  payment: ParsedPayment[];
  bags: ParsedBag[];
  segments: ParsedSegment[];
};

// -----------------------------
// HELPERS
// -----------------------------
function decodeQuotedPrintable(input: string): string {
  return input
    .replace(/=\r?\n/g, "")
    .replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
}

// Normalize all the weirdness: NBSP, Â, zero-width, extra spaces
function clean(text: string): string {
  return text
    .replace(/\u00A0/g, " ") // NBSP
    .replace(/Â/g, " ") // literal Â
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
    .replace(/\s+/g, " ")
    .trim();
}

function debugTree(node: cheerio.Cheerio<any>, $: cheerio.CheerioAPI) {
  const chain: string[] = [];
  let cur: cheerio.Cheerio<any> = node;

  for (let depth = 0; depth < 12; depth++) {
    if (!cur.length) break;
    const tag = cur[0].tagName;
    const classes = (cur.attr("class") || "").trim();
    chain.push(`${tag}${classes ? "." + classes.replace(/\s+/g, ".") : ""}`);
    cur = cur.parent();
  }

  return chain;
}

// -----------------------------
// MAIN PARSER
// -----------------------------
const eventIndex = 22;
const requestId = crypto.randomUUID();
export function parseAAEmail(
  html: string,
  receivedAt: Date,
): ParsedTravelSnapshot {
  // -----------------------------
  // HTML PARSING
  // -----------------------------
  const fullyDecoded = decodeQuotedPrintable(html);
  const $ = cheerio.load(fullyDecoded);

  // -----------------------------
  // CONFIRMATION CODE
  // -----------------------------
  const confirmationCode = clean(
    $('span:contains("Confirmation code")').next().text().trim() ||
      $('td:contains("Confirmation code") span').last().text().trim(),
  );

  // -----------------------------
  // ISSUED DATE
  // -----------------------------
  const issuedDate = clean(
    $(".background-color-standard span")
      .filter((_, el) => $(el).text().includes("Issued"))
      .next()
      .text()
      .trim(),
  );

  // -----------------------------
  // PASSENGERS
  // -----------------------------
  const passengers: ParsedPassenger[] = [];
  const seen = new Set<string>();

  $("td.basic").each((_, el) => {
    const text = clean($(el).text());
    if (!/AAdvantage/i.test(text)) return;

    const name = clean(text.split("-")[0] || "");
    if (!seen.has(name)) {
      seen.add(name);
      passengers.push({ name });
    }
  });

  // -----------------------------
  // PAYMENT
  // -----------------------------
  const payment: ParsedPayment[] = [];

  $('td.basic.whiteTextApple:contains("$")')
    .closest("tr")
    .each((_, row) => {
      const tds = $(row).find("td");
      if (tds.length < 2) return;

      const label = clean(tds.eq(0).text());
      const amount = clean(tds.eq(1).text());

      if (amount.startsWith("$")) {
        payment.push({ label, amount });
      }
    });

  // -----------------------------
  // BAGS (none for now)
  // -----------------------------
  const bags: ParsedBag[] = [];

  // -----------------------------
  // DATES (index-based)
  // -----------------------------
  const dateHeaders = $(".itinerary-header.darkmode-altblue")
    .map((_, el) => clean($(el).text()))
    .get();

  // -----------------------------
  // SEGMENTS
  // -----------------------------
  const segments: ParsedSegment[] = [];

  const airportBlocks = $("td.itinerary-iata").toArray();

  for (let i = 0; i < airportBlocks.length; i += 2) {
    const depEl = airportBlocks[i];
    const arrEl = airportBlocks[i + 1];
    if (!arrEl) break;

    const segmentIndex = i / 2;

    // -----------------------------
    // DEPARTURE BLOCK
    // -----------------------------
    const depTable = $(depEl).closest("table");

    const departureAirport = clean($(depEl).text());
    const departureCity = clean(
      depTable.find(".itinerary-small-text").first().text(),
    );
    const departureTime = clean(
      depTable.find(".itinerary-text").first().text(),
    );

    // -----------------------------
    // ARRIVAL BLOCK
    // -----------------------------
    const arrTable = $(arrEl).closest("table");

    const arrivalAirport = clean($(arrEl).text());
    const arrivalCity = clean(
      arrTable.find(".itinerary-small-text").first().text(),
    );
    const arrivalTime = clean(arrTable.find(".itinerary-text").first().text());

    // -----------------------------
    // DATE (index-based: 0/1 → header[0], 2/3 → header[1], etc.)
    // -----------------------------
    const dateIndex = Math.floor(segmentIndex);
    const date = dateHeaders[dateIndex] ?? dateHeaders[0] ?? "";

    // -----------------------------
    // FLIGHT NUMBER + OPERATED BY
    // -----------------------------
    const flightCell = depTable.closest("td").next("td");
    const flightSpans = flightCell.find(".itinerary-small-text");

    const flightNumber = clean(
      flightSpans
        .filter((_, el) => $(el).text().includes("AA"))
        .first()
        .text(),
    );

    const operatedBy = clean(
      flightSpans
        .filter((_, el) => $(el).text().includes("Operated"))
        .map((_, el) => $(el).text())
        .get()
        .join(" "),
    );

    // -----------------------------
    // SEATS (regex-filtered from merged row)
    // -----------------------------
    const seatRow = arrTable
      .closest("td")
      .next("td")
      .find("tr")
      .filter((_, tr) => $(tr).text().includes("Seat"))
      .first();

    const seats = clean(seatRow.text())
      .split(/\s+/)
      .map((t) => t.replace("Seat:", "").replace(",", "").trim())
      .filter((t) => /^[0-9]{1,2}[A-Z]$/.test(t));

    // -----------------------------
    // LOGGING (shape you requested)
    // -----------------------------
    const built = {
      ip: "34.228.247.225",
      url: "https://www.kraus.my.id/api/ping",
      zulu: "2026-03-30T17:45:12.421Z",
      local: "3/30/2026, 1:45:12 PM",
      route: "PING",
      method: "GET",
      userId: "UID-1234",
      sessionEmail: "sessionEmail-1234",
      sessionUser: "sessionUser-1234",
    };
    logj({
      domain: "travel",
      level: "info",
      message: "aa-segment-debugging",
      file: "lib/travel/parser/aa.ts",
      line: 245,
      payload: {
        i: segmentIndex,
        date: date,
        departureAirport: departureAirport,
        departureCity: departureCity,
        departureTime: departureTime,
        arrivalAirport: arrivalAirport,
        arrivalCity: arrivalCity,
        arrivalTime: arrivalTime,
        flightNumber: flightNumber,
        operatedBy: operatedBy,
        seats: seats,
        depTree: debugTree($(depEl), $),
        arrTree: debugTree($(arrEl), $),
        rawSeatRow: clean(seatRow.text()),
        rawFlightCell: clean(flightCell.text()),
      },
      meta: {
        built,
      },
    });

    segments.push({
      date,
      departureAirport,
      departureCity,
      departureTime,
      arrivalAirport,
      arrivalCity,
      arrivalTime,
      flightNumber,
      operatedBy,
      seats,
    });
  }

  return {
    source: "AA_EMAIL",
    receivedAt,
    confirmationCode,
    issuedDate,
    rawHtml: fullyDecoded,
    passengers,
    payment,
    bags,
    segments,
  };
}
