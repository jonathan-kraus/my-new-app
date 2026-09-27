// lib/travel/ingest/email-ingest.ts

import fs from "fs";
import path from "path";
import { simpleParser } from "mailparser";
import { db8 } from "@/lib/db.prisma8";
import { createId } from "@paralleldrive/cuid2";
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
  if (files.length === 0) {
    logj({
      domain: "ingest",
      level: "info",
      message: "INGEST aborted: no .eml files found",
      file: "src/lib/travel/ingest/email-ingest.ts",
      line: 23,
      payload: { filesCount: files.length },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return;
  }

  // 2️⃣ File selection - pick the most recently modified file
  const filesWithStats = files.map((f) => ({
    name: f,
    mtime: fs.statSync(path.join(dir, f)).mtime,
  }));
  filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  const fileName: string = filesWithStats[0]!.name;
  const filePath = path.join(dir, fileName);

  logj({
    domain: "ingest",
    level: "info",
    message: "Selected email for ingestion: " + filePath,
    file: "src/lib/travel/ingest/email-ingest.ts",
    line: 39,
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
    file: "src/lib/travel/ingest/email-ingest.ts",
    line: 54,
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
    file: "src/lib/travel/ingest/email-ingest.ts",
    line: 84,
    payload: { htmlLength: html.length },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // 6️⃣ Parse AA itinerary
  const parsed = parseAAEmail(html, new Date());
  console.log("INGEST: parsed snapshot =", parsed);

  // 7️⃣ Validate parser output
  console.log("INGEST: parsed.confirmationCode =", parsed.confirmationCode);
  logj({
    domain: "ingest",
    level: "info",
    message: `INGEST: parsed.confirmationCode = ${parsed.confirmationCode}`,
    file: "src/lib/travel/ingest/email-ingest.ts",
    line: 100,
    payload: { confirmationCode: parsed.confirmationCode },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  console.log("INGEST: parsed.segments count =", parsed.segments?.length);

  // 8️⃣ Dedupe check - update if exists
  const existing = await db8.orm.public.TravelSnapshot.where({
    confirmationCode: parsed.confirmationCode,
  }).first();

  console.log(
    "INGEST: dedupe check result =",
    existing ? "FOUND - will update" : "NOT FOUND - will insert",
  );
  logj({
    domain: "ingest",
    level: "info",
    message: `INGEST: dedupe check result = ${existing ? "FOUND - will update" : "NOT FOUND - will insert"}`,
    file: "src/lib/travel/ingest/email-ingest.ts",
    line: 120,
    payload: {
      confirmationCode: parsed.confirmationCode,
      existing: !!existing,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // 9️⃣ DB insert or update attempt
  console.log("INGEST: inserting/updating snapshot in DB");

  let created;
  try {
    created = await db8.transaction(async (tx) => {
      let snapshot: any;

      if (existing) {
        console.log("INGEST: updating existing snapshot", existing.id);
        await logj({
          domain: "ingest",
          level: "info",
          message: "INGEST: starting snapshot update",
          file: "src/lib/travel/ingest/email-ingest.ts",
          line: 139,
          payload: {
            existingId: existing.id,
            confirmationCode: parsed.confirmationCode,
          },
          meta: { built: { ...built, eventIndex: ++jei } },
        });

        // Update existing snapshot
        await tx.orm.public.TravelSnapshot.where({ id: existing.id }).update({
          source: parsed.source,
          receivedAt: parsed.receivedAt,
          confirmationCode: parsed.confirmationCode,
          issuedDate: parsed.issuedDate,
          rawHtml: parsed.rawHtml,
          passengers: parsed.passengers,
          payment: parsed.payment,
          bags: parsed.bags,
        });

        await logj({
          domain: "ingest",
          level: "info",
          message: "INGEST: snapshot update completed",
          file: "src/lib/travel/ingest/email-ingest.ts",
          line: 139,
          payload: { existingId: existing.id },
          meta: { built: { ...built, eventIndex: ++jei } },
        });

        // Fetch the updated snapshot
        snapshot = await tx.orm.public.TravelSnapshot.where({
          id: existing.id,
        }).first();

        if (!snapshot) {
          throw new Error("Failed to fetch updated snapshot");
        }

        console.log("INGEST: fetched updated snapshot", snapshot.id);
        await logj({
          domain: "ingest",
          level: "info",
          message: "INGEST: fetched updated snapshot",
          file: "src/lib/travel/ingest/email-ingest.ts",
          line: 139,
          payload: { snapshotId: snapshot.id },
          meta: { built: { ...built, eventIndex: ++jei } },
        });

        // Delete old segments
        await tx.orm.public.TravelSegment.where({
          snapshotId: existing.id,
        }).delete();
        console.log("INGEST: deleted old segments");
        await logj({
          domain: "ingest",
          level: "info",
          message: "INGEST: deleted old segments",
          file: "src/lib/travel/ingest/email-ingest.ts",
          line: 139,
          payload: { snapshotId: existing.id },
          meta: { built: { ...built, eventIndex: ++jei } },
        });

        // Create new segments
        let segmentCount = 0;
        for (const seg of parsed.segments) {
          await tx.orm.public.TravelSegment.create({
            id: createId(),
            snapshotId: snapshot.id,
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
          });
          segmentCount++;
        }
        console.log("INGEST: created new segments", segmentCount);
        await logj({
          domain: "ingest",
          level: "info",
          message: "INGEST: created new segments",
          file: "src/lib/travel/ingest/email-ingest.ts",
          line: 139,
          payload: { segmentCount, snapshotId: snapshot.id },
          meta: { built: { ...built, eventIndex: ++jei } },
        });
      } else {
        console.log("INGEST: creating new snapshot");
        await logj({
          domain: "ingest",
          level: "info",
          message: "INGEST: starting new snapshot creation",
          file: "src/lib/travel/ingest/email-ingest.ts",
          line: 139,
          payload: { confirmationCode: parsed.confirmationCode },
          meta: { built: { ...built, eventIndex: ++jei } },
        });

        // Create new snapshot
        snapshot = await tx.orm.public.TravelSnapshot.create({
          id: createId(),
          source: parsed.source,
          receivedAt: parsed.receivedAt,
          confirmationCode: parsed.confirmationCode,
          issuedDate: parsed.issuedDate,
          rawHtml: parsed.rawHtml,
          passengers: parsed.passengers,
          payment: parsed.payment,
          bags: parsed.bags,
        });

        if (!snapshot) {
          throw new Error("Failed to create snapshot");
        }

        console.log("INGEST: created snapshot", snapshot.id);
        await logj({
          domain: "ingest",
          level: "info",
          message: "INGEST: created new snapshot",
          file: "src/lib/travel/ingest/email-ingest.ts",
          line: 139,
          payload: {
            snapshotId: snapshot.id,
            confirmationCode: parsed.confirmationCode,
          },
          meta: { built: { ...built, eventIndex: ++jei } },
        });

        let segmentCount = 0;
        for (const seg of parsed.segments) {
          await tx.orm.public.TravelSegment.create({
            id: createId(),
            snapshotId: snapshot.id,
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
          });
          segmentCount++;
        }
        console.log("INGEST: created segments", segmentCount);
        await logj({
          domain: "ingest",
          level: "info",
          message: "INGEST: created segments",
          file: "src/lib/travel/ingest/email-ingest.ts",
          line: 139,
          payload: { segmentCount, snapshotId: snapshot.id },
          meta: { built: { ...built, eventIndex: ++jei } },
        });
      }
      return { ...snapshot, receivedAt: new Date(`${snapshot.receivedAt}Z`) };
    });
    console.log("INGEST: transaction completed successfully");
    await logj({
      domain: "ingest",
      level: "info",
      message: "INGEST: transaction completed successfully",
      file: "src/lib/travel/ingest/email-ingest.ts",
      line: 139,
      payload: { confirmationCode: parsed.confirmationCode },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
  } catch (error) {
    console.error("INGEST: transaction failed", error);
    await logj({
      domain: "ingest",
      level: "error",
      message: "INGEST: transaction failed - " + String(error),
      file: "src/lib/travel/ingest/email-ingest.ts",
      line: 139,
      payload: {
        error: String(error),
        confirmationCode: parsed.confirmationCode,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    throw error;
  }

  // 🔟 DB insert success
  console.log("INGEST: created DB row id =", created.id);
  logj({
    domain: "ingest",
    level: "info",
    message: `INGEST: transaction completed successfully - created DB row id = ${created.id}`,
    file: "src/lib/travel/ingest/email-ingest.ts",
    line: 171,
    payload: {
      createdId: created.id,
      confirmationCode: parsed.confirmationCode,
      segmentsCount: parsed.segments.length,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  return created;
}
