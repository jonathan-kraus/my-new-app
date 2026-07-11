import * as cheerio from "cheerio";
import { logj } from "@/lib/log/logj";

// -----------------------------
// MIME EXTRACTION
// -----------------------------
function extractHtmlPart(raw: string): string {
  const htmlRegex = /Content-Type:\s*text\/html[\s\S]*?\r?\n\r?\n([\s\S]+)/i;
  const match = raw.match(htmlRegex);
  if (!match) return raw;
  return (match[1] ?? "").trim();
}

function extractBase64Html(raw: string): string | null {
  const marker = "Content-Transfer-Encoding: base64";
  const idx = raw.indexOf(marker);
  if (idx === -1) return null;

  const payloadStart = raw.indexOf("\n\n", idx);
  if (payloadStart === -1) return null;

  const base64Payload = raw.slice(payloadStart).trim();
  try {
    return Buffer.from(base64Payload, "base64").toString("utf8");
  } catch {
    return null;
  }
}

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

function clean(text: string): string {
  return text
    .replace(/\u00A0/g, " ")
    .replace(/Â/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
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
// TYPES
// -----------------------------
export type ParsedPassenger = { name: string };
export type ParsedPayment = { label: string; amount: string };
export type ParsedBag = { description: string; price?: string };
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
// MAIN PARSER
// -----------------------------
export function parseAAEmail(
  rawEmail: string,
  receivedAt: Date,
): ParsedTravelSnapshot {
  // STEP 1: Extract HTML MIME part
  const htmlPart = extractHtmlPart(rawEmail);

  // STEP 2: Decode base64 or quoted-printable
  const base64Html = extractBase64Html(htmlPart);
  const fullyDecoded = base64Html ?? decodeQuotedPrintable(htmlPart);

  // STEP 3: Load Cheerio
  const $ = cheerio.load(fullyDecoded);

  // -----------------------------
  // CONFIRMATION CODE
  // -----------------------------
  function extractConfirmationCode($: cheerio.CheerioAPI): string {
    const candidates = [
      $('*:contains("Confirmation code")').next(),
      $('*:contains("Record Locator")').next(),
      $('td:contains("Confirmation")').find("span").last(),
      $('td:contains("Record Locator")').find("span").last(),
      $('strong:contains("Record Locator")').next(),
      $('p:contains("Record Locator")').next(),
      $('div:contains("Record Locator")').next(),
    ];

    for (const c of candidates) {
      const text = clean(c.text());
      if (text && text.length <= 10) return text;
    }

    // Fallback: regex search
    const regex = /Record Locator[:\s]+([A-Z0-9]{5,8})/i;
    const match = fullyDecoded.match(regex);
    if (match) return match[1] ?? "";

    return "";
  }

  const confirmationCode = extractConfirmationCode($);
  const issuedDate = extractIssuedDate($);

  // -----------------------------
  // ISSUED DATE
  // -----------------------------
  function extractIssuedDate($: cheerio.CheerioAPI): string {
    const el = $('td:contains("Issued"), span:contains("Issued")').first();
    if (!el.length) return "";

    const raw = clean(el.next().text().trim()) || clean(el.text().trim());

    if (
      raw.includes("inherit") ||
      raw.includes("important") ||
      raw.includes("text-decoration")
    ) {
      return "";
    }

    const dateMatch = raw.match(
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/,
    );

    return dateMatch ? dateMatch[0] : "";
  }

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
  // SEGMENTS
  // -----------------------------
  const segments: ParsedSegment[] = [];

  const airportBlocks = $(
    "td.itinerary-iata, \
     td.itinerary-iata-code, \
     td.iata-code, \
     td.iata, \
     td.airport-code, \
     td.airportCode, \
     td.iataCell, \
     td.iata-code-cell, \
     td.iata-text, \
     td.airport-code-text, \
     td.airport, \
     td.code",
  ).toArray();

  const dateHeaders = $(".itinerary-header.darkmode-altblue")
    .map((_, el) => clean($(el).text()))
    .get();

  for (let i = 0; i < airportBlocks.length; i += 2) {
    const depEl = airportBlocks[i];
    const arrEl = airportBlocks[i + 1];
    if (!arrEl) break;

    const segmentIndex = i / 2;

    const depTable = $(depEl).closest("table");
    const arrTable = $(arrEl).closest("table");

    const departureAirport = clean($(depEl).text());
    const departureCity = clean(
      depTable.find(".itinerary-small-text").first().text(),
    );
    const departureTime = clean(
      depTable.find(".itinerary-text").first().text(),
    );

    const arrivalAirport = clean($(arrEl).text());
    const arrivalCity = clean(
      arrTable.find(".itinerary-small-text").first().text(),
    );
    const arrivalTime = clean(arrTable.find(".itinerary-text").first().text());

    const dateIndex = Math.floor(segmentIndex);
    const date = dateHeaders[dateIndex] ?? dateHeaders[0] ?? "";

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

    logj({
      domain: "travel",
      level: "info",
      message: "aa-segment-debugging",
      file: "lib/travel/parser/aa.ts",
      line: 245,
      payload: {
        i: segmentIndex,
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
        depTree: debugTree($(depEl), $),
        arrTree: debugTree($(arrEl), $),
        rawSeatRow: clean(seatRow.text()),
        rawFlightCell: clean(flightCell.text()),
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
    bags: [],
    segments,
  };
}
