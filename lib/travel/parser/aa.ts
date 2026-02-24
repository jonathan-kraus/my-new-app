import * as cheerio from "cheerio";

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

/**
 * Find the date header that appears above the given segment block.
 */
function findDateForSegment(segmentTable: any, $: cheerio.CheerioAPI): string {
  const headerSelector = ".itinerary-header";

  // The segment table is inside:
  // <tr><td><table>SEGMENT</table></td></tr>
  // We want the <tr> that contains this segment.
  let row = $(segmentTable).closest("tr");

  while (row.length) {
    const header = row.prevAll(headerSelector).first();
    if (header.length) return header.text().trim();
    row = row.parent();
  }

  return $(headerSelector).first().text().trim();
}

// -----------------------------
// MAIN PARSER
// -----------------------------
export function parseAAEmail(
  html: string,
  receivedAt: Date,
): ParsedTravelSnapshot {
  const fullyDecoded = decodeQuotedPrintable(html);
  const $ = cheerio.load(fullyDecoded);

  // -----------------------------
  // CONFIRMATION CODE
  // -----------------------------
  const confirmationCode =
    $('span:contains("Confirmation code")').next().text().trim() ||
    $('td:contains("Confirmation code") span').last().text().trim();

  // -----------------------------
  // ISSUED DATE
  // -----------------------------
  const issuedDate = $(".background-color-standard span")
    .filter((_, el) => $(el).text().includes("Issued"))
    .next()
    .text()
    .trim();

  // -----------------------------
  // PASSENGERS
  // -----------------------------
  const passengers: ParsedPassenger[] = [];
  const seen = new Set<string>();

  $("td.basic").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!/AAdvantage/i.test(text)) return;

    const name = text.split("-")[0].trim();
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

      const label = tds.eq(0).text().replace(/\s+/g, " ").trim();
      const amount = tds.eq(1).text().trim();

      if (amount.startsWith("$")) {
        payment.push({ label, amount });
      }
    });

  // -----------------------------
  // BAGS (none)
  // -----------------------------
  const bags: ParsedBag[] = [];

  // -----------------------------
  // SEGMENTS
  // -----------------------------
  const segments: ParsedSegment[] = [];

  const airportBlocks = $("td.itinerary-iata").toArray();

  for (let i = 0; i < airportBlocks.length; i += 2) {
    const depEl = airportBlocks[i];
    const arrEl = airportBlocks[i + 1];
    if (!arrEl) break;

    // -----------------------------
    // DEPARTURE BLOCK
    // -----------------------------
    const depTable = $(depEl).closest("table");

    const departureAirport = $(depEl).text().trim();
    const departureCity = depTable.find(".itinerary-small-text").first().text().trim();
    const departureTime = depTable.find(".itinerary-text").first().text().trim();

    // -----------------------------
    // ARRIVAL BLOCK
    // -----------------------------
    const arrTable = $(arrEl).closest("table");

    const arrivalAirport = $(arrEl).text().trim();
    const arrivalCity = arrTable.find(".itinerary-small-text").first().text().trim();
    const arrivalTime = arrTable.find(".itinerary-text").first().text().trim();

    // -----------------------------
    // DATE (correct DOM proximity)
    // -----------------------------
    const date = findDateForSegment(depTable, $);

    // -----------------------------
    // FLIGHT NUMBER + OPERATED BY
    // -----------------------------
    const flightCell = depTable.closest("td").next("td");
    const flightSpans = flightCell.find(".itinerary-small-text");

    const flightNumber = flightSpans
      .filter((_, el) => $(el).text().includes("AA"))
      .first()
      .text()
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const operatedBy = flightSpans
      .filter((_, el) => $(el).text().includes("Operated"))
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" ");

    // -----------------------------
    // SEATS (row-scoped)
    // -----------------------------
    const seatRow = arrTable
      .closest("td")
      .next("td")
      .find("tr")
      .filter((_, tr) => $(tr).text().includes("Seat"))
      .first();

    const seats = seatRow
      .find("span")
      .map((_, el) =>
        $(el)
          .text()
          .replace("Seat:", "")
          .replace(",", "")
          .trim(),
      )
      .get()
      .filter((s) => s.length > 0);

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

  // -----------------------------
  // RETURN SNAPSHOT
  // -----------------------------
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
