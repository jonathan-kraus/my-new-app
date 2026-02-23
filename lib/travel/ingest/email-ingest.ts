import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { parseAAConfirmation } from "@/lib/travel/parser/aa";
import type { ParsedTravelSnapshot } from "@/lib/travel/models/parsed-snapshot";

export async function ingestTravelEmails() {
  const dir = path.join(process.cwd(), "travel-emails");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".eml"));

  if (files.length === 0) {
    throw new Error("No .eml files found in travel-emails/");
  }

  const latest = files.sort().reverse()[0];
  const fullPath = path.join(dir, latest);
  const raw = fs.readFileSync(fullPath, "utf8");

  const parsed: ParsedTravelSnapshot = parseAAConfirmation(raw);

  const created = await db.travelSnapshot.create({
    data: {
      id: parsed.id,
      source: parsed.source,
      receivedAt: parsed.receivedAt,
      confirmationCode: parsed.confirmationCode,
      issuedDate: parsed.issuedDate,
      passengers: parsed.passengers as any,
      payment: parsed.payment as any,
      bags: parsed.bags as any,

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
          operatedBy: seg.operatedBy ?? null,
          marketedAs: null,
          cabin: null,
          fareClass: seg.fareClass,
          seats: seg.seats.length ? seg.seats.join(", ") : null,
        })),
      },
    },
  });

  return created;
}
