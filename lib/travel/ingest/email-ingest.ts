// lib/travel/ingest/email-ingest.ts

import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { parseAAEmail } from "@/lib/travel/parser/aa";

// 1. Decode quoted-printable BEFORE extracting HTML
function decodeQuotedPrintable(input: string): string {
  return (
    input
      // remove soft line breaks
      .replace(/=\r?\n/g, "")
      // decode =XX hex escapes
      .replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
  );
}

// 2. Extract only the HTML portion AFTER decoding
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

  // Dynamically detect .eml files in the folder
  const dir = path.join(process.cwd(), "travel-emails");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".eml"));

  if (files.length === 0) {
    throw new Error("No .eml files found in travel-emails/");
  }


// Sort by modified time descending
const sorted = files
  .map((name) => {
    const full = path.join(dir, name);
    return { name, mtime: fs.statSync(full).mtime };
  })
  .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

// Pick the newest file
const newest = sorted[0].name;
const filePath = path.join(dir, newest);
console.log("INGEST: dir =", dir);
console.log("INGEST: files =", files);
console.log("INGEST: reading newest file:", newest);

  const raw = fs.readFileSync(filePath, "utf8");

  // *** CRITICAL FIX ***
  // Decode BEFORE extracting HTML
  const decodedEml = decodeQuotedPrintable(raw);

  // Extract HTML AFTER decoding
  const html = extractHtmlPart(decodedEml);

  console.log("INGEST: extracted HTML length =", html.length);

  // Parse the HTML
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

          seats: seg.seats, // String[]? in Prisma
        })),
      },

      passengers: {
        create: parsed.passengers.map((p) => ({ name: p.name })),
      },

      payment: {
        create: parsed.payment.map((p) => ({
          label: p.label,
          amount: p.amount,
        })),
      },

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
