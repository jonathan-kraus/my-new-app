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

  // Dynamically find .eml files in the folder
  const dir = path.join(process.cwd(), "travel-emails");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".eml"));

  if (files.length === 0) {
    throw new Error("No .eml files found in travel-emails/");
  }

  // Use the first .eml file
  const filePath = path.join(dir, files[0]);
  console.log("INGEST: reading file:", filePath);

  const raw = fs.readFileSync(filePath, "utf8");

  // Extract HTML
  const html = extractHtmlPart(raw);

  console.log("INGEST: extracted HTML length =", html.length);

  // Parse
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

      segments: {
        create: parsed.segments.map(seg => ({
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
          seats: seg.seats, // now String[]?
        })),
      },

      passengers: {
        create: parsed.passengers.map(p => ({ name: p.name })),
      },

      payment: {
        create: parsed.payment.map(p => ({
          label: p.label,
          amount: p.amount,
        })),
      },

      bags: {
        create: parsed.bags.map(b => ({
          description: b.description,
        })),
      },
    },
  });

  console.log("INGEST: created DB row id =", created.id);

  return created;
}
