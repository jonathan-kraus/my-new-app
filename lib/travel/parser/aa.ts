import * as cheerio from "cheerio";

export function parseAAEmail(html: string, receivedAt: Date) {
  const fullyDecoded = html
    .replace(/=\r?\n/g, "")
    .replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );

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
  const passengers = [];
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
  const payment = [];

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
  // SEGMENTS
  // -----------------------------
  const segments = [];

  const dateHeaders = $(".itinerary-header")
    .map((_, el) => $(el).text().trim())
    .get();

  const airportBlocks = $("td.itinerary-iata").toArray();

  for (let i = 0; i < airportBlocks.length; i += 2) {
    const depEl = airportBlocks[i];
    const arrEl = airportBlocks[i + 1];
    if (!arrEl) break;

    const depTable = $(depEl).closest("table");
    const arrTable = $(arrEl).closest("table");

    const departureAirport = $(depEl).text().trim();
    const departureCity = depTable.find(".itinerary-small-text").first().text().trim();
    const departureTime = depTable.find(".itinerary-text").first().text().trim();

    const arrivalAirport = $(arrEl).text().trim();
    const arrivalCity = arrTable.find(".itinerary-small-text").first().text().trim();
    const arrivalTime = arrTable.find(".itinerary-text").first().text().trim();

    // -----------------------------
    // DATE (based on index)
    // -----------------------------
    const dateIndex = Math.floor(i / 2);
    const date = dateHeaders[dateIndex] ?? dateHeaders[0];

    // -----------------------------
    // FLIGHT NUMBER + OPERATED BY
    // -----------------------------
    const flightBlock = depTable.parent().next().find(".itinerary-small-text");

    const flightNumber = flightBlock
      .filter((_, el) => $(el).text().includes("AA"))
      .first()
      .text()
      .trim();

    const operatedBy = flightBlock
      .filter((_, el) => $(el).text().includes("Operated"))
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" ");

    // -----------------------------
    // SEATS
    // -----------------------------
    const seatBlock = arrTable.parent().next().find('.itinerary-small-text:contains("Seat")');

    const seats = seatBlock
      .parent()
      .find("span")
      .map((_, el) => $(el).text().replace("Seat:", "").trim())
      .get()
      .filter((s) => s && s !== ",");

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
