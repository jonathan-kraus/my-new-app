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
      String.fromCharCode(parseInt(hex, 16))
    );
}

export function parseAAEmail(html: string, receivedAt: Date): ParsedTravelSnapshot {
  // AA HTML is double-encoded → decode again
  const fullyDecoded = decodeQuotedPrintable(html);
  const $ = cheerio.load(fullyDecoded);

  // -----------------------------
  // CONFIRMATION CODE
  // -----------------------------
  const confirmationCode =
    $('span:contains("Confirmation code")')
      .next()
      .text()
      .trim() ||
    $('td:contains("Confirmation code") span')
      .last()
      .text()
      .trim();

  // -----------------------------
  // ISSUED DATE
  // -----------------------------
  const issuedDate = $('td:contains("Issued:")')
    .find("span")
    .last()
    .text()
    .trim();

  // -----------------------------
  // TRIP DATE (e.g. Saturday, March 7, 2026)
  // -----------------------------
  const tripDate = $(".itinerary-header")
    .first()
    .text()
    .trim();

  // -----------------------------
  // PASSENGERS (deduped)
  // -----------------------------
  const passengers: ParsedPassenger[] = [];
  const seen = new Set<string>();

  $('td.basic').each((_, el) => {
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
  // SEGMENTS
  // -----------------------------
  const segments: ParsedSegment[] = [];

  // Each segment starts with a departure airport code
  $('td.itinerary-iata').each((_, el) => {
    const depAirport = $(el).text().trim();

    const depCity = $(el)
      .closest("table")
      .find(".itinerary-small-text")
      .eq(0)
      .text()
      .trim();

    const depTime = $(el)
      .closest("table")
      .find(".itinerary-text")
      .eq(0)
      .text()
      .trim();

    // Arrival block is the next itinerary-iata
    const arrivalBlock = $(el).closest("tr").next().find("td.itinerary-iata");

    const arrAirport = arrivalBlock.text().trim();
    const arrCity = arrivalBlock
      .closest("table")
      .find(".itinerary-small-text")
      .eq(0)
      .text()
      .trim();

    const arrTime = arrivalBlock
      .closest("table")
      .find(".itinerary-text")
      .eq(0)
      .text()
      .trim();

    const flightNumber = $(el)
      .closest("tr")
      .find('.itinerary-small-text:contains("AA")')
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const operatedBy = $(el)
      .closest("tr")
      .find('.itinerary-small-text:contains("Operated")')
      .text()
      .replace(/\s+/g, " ")
      .trim();

    // Seats (if present)
    const seats: string[] = [];
    $(el)
      .closest("table")
      .find('.itinerary-small-text:contains("Seat")')
      .each((_, seatEl) => {
        const seat = $(seatEl).text().trim();
        if (seat) seats.push(seat);
      });

    segments.push({
      date: tripDate,
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
  });

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
