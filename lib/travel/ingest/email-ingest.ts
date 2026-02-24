// lib/travel/ingest/email-ingest.ts

import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { parseAAEmail } from "@/lib/travel/parser/aa";

// Extract only the HTML portion from the .eml file
function extractHtmlPart(eml: string): string {
  const idx = eml.indexOf("<!DOCTYPE html>");
  if (idx === -1) {
    console.warn("WARNING: <!DOCTYPE html> not found — using full file");
    return eml;
  }
  return eml.slice(idx);
}

export async function ingestTravelEmails() {
  console.log("INGEST: starting travel email ingestion");

  const filePath = path.join(process.cwd(), "travel-mail", "aa.eml");
  const raw = fs.readFileSync(filePath, "utf8");

  // Extract the HTML part before parsing
  const html = extractHtmlPart(raw);

  console.log("INGEST: extracted HTML length =", html.length);

  // Parse the HTML into a TravelSnapshot
  const parsed = parseAAEmail(html, new Date());

  console.log("INGEST: parsed snapshot =", parsed);

  // Write to DB
  const created = await db.travelSnapshot.create({
    data: {
      source: parsed.source,
      receivedAt: parsed.receivedAt,
      confirmationCode: parsed.confirmationCode,
      issuedDate: parsed.issuedDate,
      rawHtml: parsed.rawHtml,

      // Segments
      segments: {
        create: parsed.segments.map((seg) => ({
          date: seg.date,
          departureAirport: seg.departureAirport,
          departureCity: seg.departureCity,
          departureTime: seg.departureTime,
          arrivalAirport: seg.arrivalAirport,
          arrivalCity: seg.arrivalCity,
          arrivalTime: seg.arrivalTime,
          flightNumber: seg.flightNumber,
          operatedBy: seg.operatedBy,
          marketedAs: seg.marketedAs,
          cabin: seg.cabin,
          fareClass: seg.fareClass,
          seats: seg.seats,
        })),
      },

      // Passengers
      passengers: {
        create: parsed.passengers.map((p) => ({
          name: p.name,
        })),
      },

      // Payment
      payment: {
        create: parsed.payment.map((p) => ({
          label: p.label,
          amount: p.amount,
        })),
      },

      // Bags
      bags: {
        create: parsed.bags.map((b) => ({
          description: b.description,
        })),
      },
    },
  });

  console.log("INGEST: created DB row id =", created.id);

  return created;
}
