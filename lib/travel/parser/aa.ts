// lib/travel/parser/aa.ts
import * as cheerio from "cheerio";
import { ParsedTravelSnapshot } from "@/lib/travel/models/parsed-snapshot";

export interface ParsedFlightSegment {
  date: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;
  flightNumber: string;
  operatedBy?: string;
  fareClass: string;
  seats: string[];
}

export function parseAAConfirmation(html: string): ParsedTravelSnapshot {
  const $ = cheerio.load(html);

  // TODO: Replace these with real extraction logic
  const confirmationCode = extractConfirmationCode($);
  const issuedDate = extractIssuedDate($);
  const passengers = extractPassengers($);
  const segments = extractSegments($);
  const payment = extractPayment($);
  const bags = extractBags($);

  return {
    id: crypto.randomUUID(),
    source: "AA_EMAIL",
    receivedAt: new Date(),
    confirmationCode,
    issuedDate,
    passengers,
    segments,
    payment,
    bags,
    rawHtml: html,
  };
}

/* -------------------------------------------------------
 * Extraction helpers (stubs for now)
 * ----------------------------------------------------- */

function extractConfirmationCode($: cheerio.CheerioAPI): string {
  return $("selector").text().trim() || "UNKNOWN";
}

function extractIssuedDate($: cheerio.CheerioAPI): string {
  return $("selector").text().trim() || "";
}

function extractPassengers($: cheerio.CheerioAPI) {
  return [];
}

function extractSegments($: cheerio.CheerioAPI): ParsedFlightSegment[] {
  return [];
}

function extractPayment($: cheerio.CheerioAPI) {
  return [];
}

function extractBags($: cheerio.CheerioAPI) {
  return [];
}
