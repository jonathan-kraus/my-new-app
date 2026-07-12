// lib/travel/ingest/email-ingest.ts

import fs from "fs";
import path from "path";
import { simpleParser } from "mailparser";
import { db } from "@/lib/db";
import { parseAAEmail } from "@/lib/travel/parser/aa";
import { logit } from "@/lib/log/logit";

export async function ingestTravelEmails() {
  console.log("INGEST: starting travel email ingestion");

  const dir = path.join(process.cwd(), "travel-emails");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".eml"));
  const eventIndex = 22;
  const requestId = crypto.randomUUID();

  // ⭐ Require EXACTLY one file
  if (files.length !== 1) {
    console.log(
      "INGEST: expected exactly one .eml file, found:",
      files.length,
      "→ ingestion aborted",
    );
    return;
  }

  // ⭐ Deterministic single-file ingestion
  const fileName: string = files[0]!;
  const filePath = path.join(dir, fileName);

  logit(
    "jonathan",
    {
      level: "info",
      message: "Selected email for ingestion: " + filePath,
      fileName,
    },
    { eventIndex },
    {
      file: "email-ingest.ts",
      route: "N/A",
      userId: undefined,
      requestId,
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );

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

  console.log("INGEST: extracted HTML length =", html.length);

  // ⭐ Parse AA itinerary from HTML
  const parsed = parseAAEmail(html, new Date());
  console.log("INGEST: parsed snapshot =", parsed);
console.log("CONFIRMATION CODE BEFORE INSERT:",  parsed.confirmationCode);

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
console.log("CONFIRMATION CODE AFTER INSERT:", parsed.confirmationCode);
  console.log("INGEST: created DB row id =", created.id);

  return created;
}
