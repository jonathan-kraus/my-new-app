// lib/travel/ingest/email-ingest.ts

import fs from "fs";
import path from "path";
import { simpleParser } from "mailparser";
import { db } from "@/lib/db";
import { parseAAEmail } from "@/lib/travel/parser/aa";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";

export async function ingestTravelEmails() {
  console.log("INGEST: starting travel email ingestion");

  const dir = path.join(process.cwd(), "travel-emails");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".eml"));
  const built = await staticUniversalContext("INGEST");
  let jei = 0;

//Require EXACTLY one file
  if (files.length !== 1) {
    logj({
    domain: "jonathan",
    level: "info",
    message: "Starting travel email ingestion",
    file: "email-ingest.ts",
    line: 21,
    payload: { filesCount: files.length },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
    return;
  }

  // ⭐ Deterministic single-file ingestion
  const fileName: string = files[0]!;
  const filePath = path.join(dir, fileName);

  logj({
    domain: "jonathan",
    level: "info",
    message: "Selected email for ingestion: " + filePath,
    file: "email-ingest.ts",
    line: 37,
    payload: { fileName },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
    

  console.log("INGEST: selected file =", filePath);

  // ⭐ Read raw file safely
  const raw = fs.readFileSync(filePath, "utf8");

  // ⭐ REAL MIME PARSING — this is the fix
  const parsedMime = await simpleParser(raw);

  let html: string | null = null;

  if (parsedMime.html) {
    html = parsedMime.html.toString();
  } else if (parsedMime.textAsHtml) {
    html = parsedMime.textAsHtml.toString();
  }

  if (!html) {
    console.error("INGEST ERROR: No HTML part found in email");
    throw new Error("No HTML part found in email");
  }

  
    if (files.length !== 1) {
    logj({
    domain: "jonathan",
    level: "info",
    message: (`INGEST: extracted HTML length = ${html.length}`),
    file: "email-ingest.ts",
    line: 71,
    payload: { htmlLength: html.length },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  // ⭐ Parse AA itinerary from HTML
  const parsed = parseAAEmail(html, new Date());
  console.log("INGEST: parsed snapshot =", parsed);
const existing = await db.travelSnapshot.findUnique({
  where: { confirmationCode: parsed.confirmationCode },
});

if (existing) {
  console.log("Skipping insert — snapshot already exists");
  return existing;
}


  // ⭐ Write to DB
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
          seats: seg.seats,
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
}