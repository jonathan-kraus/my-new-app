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

  if (files.length === 0) {
    throw new Error("No .eml files found in travel-emails/");
  }

  // Sort newest first
  const sorted = files
    .map((name) => {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);

      logit(
        "jonathan",
        {
          level: "info",
          message: "Pick email: " + full,
          full,
          lastTwo: name.split("-").slice(-2).join("-") + ".eml",
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
        }
      );

      return { name, full, mtime: stat.mtime };
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  const { full: filePath } = sorted[0];
  console.log("INGEST: selected file =", filePath);

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

  console.log(" INGEST: created DB row id =", created.id);

  return created;
}
