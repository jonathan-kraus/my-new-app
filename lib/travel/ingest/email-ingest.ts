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

  // 1️⃣ File count check
  console.log("INGEST: files found =", files.length);
  if (files.length !== 1) {
    logj({
      domain: "ingest",
      level: "info",
      message: "INGEST aborted: expected exactly one .eml file",
      file: "email-ingest.ts",
      line: 21,
      payload: { filesCount: files.length },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return;
  }

  // 2️⃣ File selection
  const fileName: string = files[0]!;
  const filePath = path.join(dir, fileName);

  logj({
    domain: "ingest",
    level: "info",
    message: "Selected email for ingestion: " + filePath,
    file: "email-ingest.ts",
    line: 38,
    payload: { fileName },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  console.log("INGEST: selected file =", filePath);

  // 3️⃣ Read raw file
  const raw = fs.readFileSync(filePath, "utf8");
  console.log("INGEST: raw file length =", raw.length);
    logj({
    domain: "ingest",
    level: "info",
    message: "INGEST: raw file length = " + raw.length,
    file: "email-ingest.ts",
    line: 53,
    payload: { length: raw.length },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // 4️⃣ MIME parsing
  const parsedMime = await simpleParser(raw);
  console.log("INGEST: parsedMime keys =", Object.keys(parsedMime));

  let html: string | null = null;

  if (parsedMime.html) {
    html = parsedMime.html.toString();
  } else if (parsedMime.textAsHtml) {
    html = parsedMime.textAsHtml.toString();
  }

  // 5️⃣ HTML extraction check
  console.log("INGEST: html exists =", !!html, "length =", html?.length);

  if (!html) {
    console.error("INGEST ERROR: No HTML part found in email");
    throw new Error("No HTML part found in email");
  }

  logj({
    domain: "ingest",
    level: "info",
    message: `INGEST: extracted HTML length = ${html.length}`,
    file: "email-ingest.ts",
    line: 74,
    payload: { htmlLength: html.length },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // 6️⃣ Parse AA itinerary
  const parsed = parseAAEmail(html, new Date());
  console.log("INGEST: parsed snapshot =", parsed);

  // 7️⃣ Validate parser output
  console.log("INGEST: parsed.confirmationCode =", parsed.confirmationCode);
  console.log("INGEST: parsed.segments count =", parsed.segments?.length);

  // 8️⃣ Dedupe check
  const existing = await db.travelSnapshot.findUnique({
    where: { confirmationCode: parsed.confirmationCode },
  });

  console.log("INGEST: dedupe check result =", existing ? "FOUND" : "NOT FOUND");

  if (existing) {
    console.log("Skipping insert — snapshot already exists");
    return existing;
  }

  // 9️⃣ DB insert attempt
  console.log("INGEST: inserting new snapshot into DB");

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

  // 🔟 DB insert success
  console.log("INGEST: created DB row id =", created.id);
logj({
      domain: "ingest",
      level: "info",
       message: `INGEST: created DB row id = ${created.id}`,
      file: "email-ingest.ts",
      line: 151,
      payload: { createdId: created.id },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
  return created;
}
