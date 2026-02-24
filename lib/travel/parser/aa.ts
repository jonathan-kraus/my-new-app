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
  // TRIP DATE (e.g. Saturday, March 7, 2026)
  // -----------------------------
  const tripDate = $(".itinerary-header").first().text().trim();

  // -----------------------------
  // PASSENGERS (deduped)
  // -----------------------------
  const passengers: ParsedPassenger[] = [];
  const seen = new Set<string>();

  $("td.basic").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();

    // Only match rows with AAdvantage number
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

  // If AA ever includes bag rows, they look like:
  // <td class="checkedbag-standard">1st bag</td>
  // <td class="checkedbag-standard">No charge</td>
  // This itinerary has none → return empty array.

  // -----------------------------
  // SEGMENTS (corrected)
  // -----------------------------
  const segments: ParsedSegment[] = [];

  const dateHeaders = $(".itinerary-header")
    .map((_, el) => $(el).text().trim())
    .get();

  const airportBlocks = $("td.itinerary-iata").toArray();

  for (let i = 0; i < airportBlocks.length; i += 2) {
    const depEl = airportBlocks[i];
    const arrEl = airportBlocks[i + 1];
    if (!arrEl) break;

    const depAirport = $(depEl).text().trim();
    const arrAirport = $(arrEl).text().trim();

    const depTable = $(depEl).closest("table");
    const depCity = depTable
      .find(".itinerary-small-text")
      .first()
      .text()
      .trim();
    const depTime = depTable.find(".itinerary-text").first().text().trim();

    const arrTable = $(arrEl).closest("table");
    const arrCity = arrTable
      .find(".itinerary-small-text")
      .first()
      .text()
      .trim();
    const arrTime = arrTable.find(".itinerary-text").first().text().trim();

    const flightNumber = $(depEl)
      .closest("tr")
      .find('.itinerary-small-text:contains("AA")')
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const operatedBy = $(depEl)
      .closest("tr")
      .find('.itinerary-small-text:contains("Operated")')
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const seats: string[] = [];
    $(depEl)
      .closest("table")
      .find('.itinerary-small-text:contains("Seat")')
      .each((_, seatEl) => {
        const seat = $(seatEl).text().trim();
        if (seat) seats.push(seat);
      });

    const dateIndex = Math.floor(i / 2);
    const date = dateHeaders[dateIndex] ?? dateHeaders[0];

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

