// lib/travel/parser/aa.ts

import * as cheerio from "cheerio";
import { parse } from "date-fns";
import { decode as decodeQuotedPrintable } from "quoted-printable";
import { TextDecoder } from "util";

export type ParsedPassenger = {
  name: string;
  aadvantage?: string | null;
  raw?: string; };

export type ParsedPayment = {
  label: string;
  amount: string;
};

export type ParsedBagInfo = {
  description: string;
};

export type ParsedFlightSegment = {
  date: string; // ISO yyyy-MM-dd
  departureAirport: string;
  departureCity: string;
  departureTime: string; // e.g. "9:14 AM"
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string; // e.g. "10:43 AM"
  flightNumber: string;
  operatedBy: string;
  marketedAs: string;
  cabin: string;
  fareClass: string;
  seats: string[];
};

export type ParsedTravelSnapshot = {
  source: "AA_EMAIL";
  receivedAt: Date;
  confirmationCode: string;
  issuedDate: string; // ISO yyyy-MM-dd
  passengers: ParsedPassenger[];
  payment: ParsedPayment[];
  bags: ParsedBagInfo[];
  segments: ParsedFlightSegment[];
  rawHtml: string;
};

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();
}

function extractIssuedDate($: cheerio.CheerioAPI): string {
  const issuedSpan = $("td.background-color-standard span")
    .filter((_, el) => $(el).text().includes("Issued:"))
    .parent()
    .find("span")
    .last()
    .text();

  const raw = cleanText(issuedSpan);
  if (!raw) return "";

  const parsed = parse(raw, "MMMM d, yyyy", new Date());
  if (isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function extractConfirmationCode($: cheerio.CheerioAPI): string {
  const codeSpan = $("span.itinerary-text")
    .filter((_, el) => $(el).text().includes("Confirmation code"))
    .find("span")
    .last()
    .text();

  const altSpan = $("span.basic")
    .filter((_, el) => $(el).text().includes("Confirmation code"))
    .parent()
    .find("span")
    .last()
    .text();

  const raw = cleanText(codeSpan || altSpan);
  return raw || "UNKNOWN";
}

function extractTripDate($: cheerio.CheerioAPI): string {
const dateSpan = $('span[class*="itinerary-header"]')
  .filter((_, el) =>
    /[A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}/.test($(el).text())
  )
  .first()
  .text();


  const raw = cleanText(dateSpan);
  if (!raw) return "";

  const parsed = parse(raw, "EEEE, MMMM d, yyyy", new Date());
  if (isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function extractSegments(
  $: cheerio.CheerioAPI,
  tripDate: string,
): ParsedFlightSegment[] {
  const segments: ParsedFlightSegment[] = [];

  // Each segment block starts at the date row, then has the PHL/BOS structure you pasted.
  $("span.itinerary-header")
.filter((_, el) => {
  const text = $(el).text();
  return /[A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}/.test(text);
})

    .each((_, dateEl) => {
      const dateCell = $(dateEl).closest("td");
      const segmentRoot = dateCell.closest("tr").next().find("table").first(); // the table containing the PHL/BOS layout

      if (!segmentRoot.length) return;

      const departureBlock = segmentRoot
        .find("td")
        .first()
        .find("table")
        .first();
      const arrivalBlock = segmentRoot
        .find("td")
        .eq(1)
        .closest("td")
        .parent()
        .next()
        .find("table")
        .first();

      const departureIata = cleanText(
        departureBlock.find("td.itinerary-iata").first().text(),
      );
      const departureCity = cleanText(
        departureBlock.find("td.itinerary-small-text").first().text(),
      );
      const departureTime = cleanText(
        departureBlock.find("td.itinerary-text").first().text(),
      );

      const flightNumber = cleanText(
        segmentRoot
          .find("span.itinerary-small-text")
          .filter((_, el) => $(el).text().includes("AA"))
          .first()
          .text(),
      ).replace(/\s+/g, " ");

      const operatedBy = cleanText(
        segmentRoot
          .find("span.itinerary-small-text")
          .filter((_, el) => $(el).text().includes("Operated by"))
          .first()
          .text(),
      );

      const marketedAs = cleanText(
        segmentRoot
          .find("span.itinerary-small-text")
          .filter((_, el) => $(el).text().includes("as "))
          .first()
          .text(),
      );

      const arrivalIata = cleanText(
        arrivalBlock.find("td.itinerary-iata").first().text(),
      );
      const arrivalCity = cleanText(
        arrivalBlock.find("td.itinerary-small-text").first().text(),
      );
      const arrivalTime = cleanText(
        arrivalBlock.find("td.itinerary-text").first().text(),
      );

      const seats: string[] = [];
      arrivalBlock
        .closest("td")
        .next()
        .find("span.itinerary-small-text")
        .each((_, seatEl) => {
          const seat = cleanText($(seatEl).text());
          if (/^\d+[A-Z]$/.test(seat.replace(",", ""))) {
            seats.push(seat.replace(",", ""));
          }
        });

      segments.push({
        date: tripDate,
        departureAirport: departureIata,
        departureCity,
        departureTime,
        arrivalAirport: arrivalIata,
        arrivalCity,
        arrivalTime,
        flightNumber,
        operatedBy,
        marketedAs,
        cabin: "",
        fareClass: "",
        seats,
      });
    });

  return segments;
}

function extractPassengers($: cheerio.CheerioAPI): ParsedPassenger[] {
  const passengers: ParsedPassenger[] = [];

  $('td.basic').each((_, el) => {
    const text = $(el).text().trim();

    // Look for AAdvantage number or masked pattern
    if (/AAdvantage|#:\s*\w+\*+/.test(text)) {
      // Clean up whitespace
      const cleaned = text.replace(/\s+/g, " ").trim();

      passengers.push({
        name: cleaned.split("-")[0].trim(), // "Jonathan Kraus"
        aadvantage: cleaned.match(/#:\s*([A-Za-z0-9*]+)/)?.[1] ?? null,
        raw: cleaned,
      });
    }
  });

  return passengers;
}


function extractPayment(_$: cheerio.CheerioAPI): ParsedPayment[] {
  // Placeholder until we map the payment section
  return [];
}

function extractBags(_$: cheerio.CheerioAPI): ParsedBagInfo[] {
  // Placeholder until we map the bag section
  return [];
}

export function parseAAEmail(
  html: string,
  receivedAt: Date,
): ParsedTravelSnapshot {

console.log("RUNNING NEW PARSER");
// 1. Decode quoted-printable
const decoded = decodeQuotedPrintable(html);
// Decode AGAIN — AA double-encodes the HTML block
const fullyDecoded = decodeQuotedPrintable(html);

// Load into Cheerio
const $ = cheerio.load(fullyDecoded);

console.log(
  "fullyDecoded",
  fullyDecoded.slice(0, 500)
  );
  // 2. Load into Cheerio const $ = cheerio.load(decoded);

  console.log("HEADER SPANS FOUND:", $("span.itinerary-header").length);

  const issuedDate = extractIssuedDate($);
  const confirmationCode = extractConfirmationCode($);
  const tripDate = extractTripDate($);
  const segments = extractSegments($, tripDate);

  const passengers = extractPassengers($);
  const payment = extractPayment($);
  const bags = extractBags($);

  return {
    source: "AA_EMAIL",
    receivedAt,
    confirmationCode,
    issuedDate,
    passengers,
    payment,
    bags,
    segments,
    rawHtml: html,
  };
}
