import * as cheerio from "cheerio";

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

function decodeQuotedPrintable(input: string): string {
  return input
    .replace(/=\r?\n/g, "")
    .replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
}

/**
 * Find the date header that appears *above* a given row.
 * This is the only reliable way to map segments to dates in AA emails.
 */
function findDateForRow(
  row: any,
  $: cheerio.CheerioAPI,
): string {
  const headerSelector = ".itinerary-header";

  // Walk upward through previous siblings
  let current = $(row).closest("tr");

  while (current.length) {
    const header = current.prevAll(headerSelector).first();
    if (header.length) {
      return header.text().trim();
    }
    current = current.parent();
  }

  // Fallback: first date header
  return $(headerSelector).first().text().trim();
}

export function parseAAEmail(
  html: string,
  receivedAt: Date,
): ParsedTravelSnapshot {
  // AA HTML is double-encoded → decode again
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
  // PASSENGERS (deduped)
  // -----------------------------
  const passengers: ParsedPassenger[] = [];
  const seen = new Set<string>();

  $("td.basic").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();

    if (!/AAdvantage/i.test(text)) return;

    const name = text.split("-")[0].trim();
    if (seen.has(name)) return;

    seen.add(name);
    passengers.push({ name });
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

      if (!amount.startsWith("$")) return;

      payment.push({ label, amount });
    });

  // -----------------------------
  // BAGS (none in this itinerary)
  // -----------------------------
  const bags: ParsedBag[] = [];

  // -----------------------------
  // SEGMENTS (corrected)
  // -----------------------------
  const segments: ParsedSegment[] = [];

  const airportBlocks = $("td.itinerary-iata").toArray();

  for (let i = 0; i < airportBlocks.length; i += 2) {
    const depEl = airportBlocks[i];
    const arrEl = airportBlocks[i + 1];
    if (!arrEl) break;

    // -----------------------------
    // DEPARTURE INFO
    // -----------------------------
    const depAirport = $(depEl).text().trim();
    const depRow = $(depEl).closest("tr");
    const depCity = depRow.find(".itinerary-small-text").first().text().trim();
    const depTime = depRow.find(".itinerary-text").first().text().trim();

    // -----------------------------
    // ARRIVAL INFO
    // -----------------------------
    const arrAirport = $(arrEl).text().trim();
    const arrRow = $(arrEl).closest("tr");
    const arrCity = arrRow.find(".itinerary-small-text").first().text().trim();
    const arrTime = arrRow.find(".itinerary-text").first().text().trim();

    // -----------------------------
    // DATE (corrected via DOM proximity)
    // -----------------------------
    const date = findDateForRow(depEl, $);

    // -----------------------------
    // FLIGHT INFO ROW
    // -----------------------------
    const infoRow = arrRow
      .nextAll("tr")
      .filter((_, tr) =>
        $(tr).find('.itinerary-small-text:contains("AA")').length > 0,
      )
      .first();

    const flightNumber = infoRow
      .find('.itinerary-small-text:contains("AA")')
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const operatedBy = infoRow
      .find('.itinerary-small-text:contains("Operated")')
      .text()
      .replace(/\s+/g, " ")
      .trim();

    // -----------------------------
    // SEAT ROW
    // -----------------------------
    const seatRow = infoRow
      .nextAll("tr")
      .filter((_, tr) =>
        $(tr).find('.itinerary-small-text:contains("Seat")').length > 0,
      )
      .first();

    const seats: string[] = [];
    seatRow
      .find('.itinerary-small-text:contains("Seat")')
      .each((_, seatEl) => {
        const seatText = $(seatEl).text().trim();
        const match = seatText.match(/Seat:\s*(.*)/i);
        if (match && match[1]) {
          match[1]
            .split(",")
            .map((s) => s.trim())
            .forEach((s) => seats.push(s));
        }
      });

    segments.push({
      date,
      departureAirport: depAirport,
      departureCity: depCity,
      departureTime: depTime,
      arrivalAirport: arrAirport,
      arrivalCity: arrCity,
      arrivalTime: arrTime,
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
