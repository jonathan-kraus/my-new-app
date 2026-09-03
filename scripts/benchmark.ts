/*
 * Benchmark script for toolVersion DB operations.
 *
 * Usage (dry-run, safe):
 *   npx ts-node scripts/benchmark/toolVersionBenchmark.ts --count 100 --changes 3
 *
 * Usage (apply writes -- BE CAREFUL):
 *   npx ts-node scripts/benchmark/toolVersionBenchmark.ts --count 100 --changes 3 --apply
 *
 * The script connects to the DB using @prisma/client and DATABASE_URL from env.
 * By default it performs the read portion (findUnique/findMany) and local logic but skips writes.
 * Pass --apply to actually execute createMany/updateMany/upserts inside transactions.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// Use ONE client everywhere
const db = new PrismaClient({ adapter });

await db.$connect();

function nowMs() {
  const [s, ns] = process.hrtime();
  return s * 1_000 + ns / 1_000_000;
}

function hrElapsed(start: number) {
  const elapsed = nowMs() - start;
  return `${elapsed.toFixed(1)} ms`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out: any = { count: 100, changes: 3, apply: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--count" && args[i + 1]) {
      out.count = Number(args[++i]);
    } else if (a === "--changes" && args[i + 1]) {
      out.changes = Number(args[++i]);
    } else if (a === "--apply") {
      out.apply = true;
    } else if (a === "--help" || a === "-h") {
      out.help = true;
    }
  }
  return out;
}

function randSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

async function buildToolEntries(total: number, changeCount: number) {
  // Fetch some existing tools to make the scenario realistic
  const existing = await db.toolVersion.findMany({ take: Math.min(50, total) });

  const entries: { name: string; version: string }[] = [];

  // Use existing names for some of the entries

  for (const e of existing) {
    if (!e) continue;
    entries.push({ name: e.name, version: e.version });
  }

  // Add more entries as needed (new names)
  while (entries.length < total) {
    entries.push({
      name: `benchmark-tool-${randSuffix()}`,
      version: `1.0.${Math.floor(Math.random() * 10)}`,
    });
  }

  // Introduce some version changes among existing entries
  let changed = 0;
  for (let i = 0; i < entries.length && changed < changeCount; i++) {
    const e = entries[i];
    if (!e) continue;

    if (!e.name.startsWith("benchmark-tool-")) {
      e.version = `${e.version}-updated`;
      changed++;
    }
  }

  return entries;
}

async function sequentialBenchmark(
  toolEntries: { name: string; version: string }[],
  apply: boolean,
) {
  const start = nowMs();
  let creates = 0;
  let verified = 0;
  let changes = 0;

  for (const { name, version } of toolEntries) {
    const current = await db.toolVersion.findUnique({ where: { name } });
    if (!current) {
      creates++;
      if (apply) {
        await db.toolVersion.create({
          data: {
            name,
            version,
            added_at: new Date(),
            verified_at: new Date(),
          },
        });
      }
      continue;
    }

    if (current.version === version) {
      verified++;
      if (apply) {
        await db.toolVersion.update({
          where: { name },
          data: { verified_at: new Date() },
        });
      }
      continue;
    }

    // version changed
    changes++;
    const baseName = `base${name}`;
    if (apply) {
      await db.toolVersion.upsert({
        where: { name: baseName },
        create: {
          name: baseName,
          version: current.version,
          added_at: current.added_at ?? new Date(),
          verified_at: new Date(),
        },
        update: { version: current.version, verified_at: new Date() },
      });

      await db.toolVersion.update({
        where: { name },
        data: { version, added_at: new Date(), verified_at: new Date() },
      });
    }
  }

  const elapsed = hrElapsed(start);
  return { elapsed, creates, verified, changes };
}

async function batchedBenchmark(
  toolEntries: { name: string; version: string }[],
  apply: boolean,
) {
  const start = nowMs();
  const names = toolEntries.map((t) => t.name);
  const existing = await db.toolVersion.findMany({
    where: { name: { in: names } },
  });
  const existingMap: Record<string, any> = Object.fromEntries(
    existing.map((e) => [e.name, e]),
  );

  const toCreate: any[] = [];
  const verifyNames: string[] = [];
  const toChange: { name: string; version: string; current: any }[] = [];

  for (const { name, version } of toolEntries) {
    const current = existingMap[name];
    if (!current) {
      toCreate.push({
        name,
        version,
        added_at: new Date(),
        verified_at: new Date(),
      });
    } else if (current.version === version) {
      verifyNames.push(name);
    } else {
      toChange.push({ name, version, current });
    }
  }

  if (apply) {
    await db.$transaction(async (tx) => {
      if (toCreate.length) {
        await tx.toolVersion.createMany({
          data: toCreate,
          skipDuplicates: true,
        });
      }

      if (verifyNames.length) {
        await tx.toolVersion.updateMany({
          where: { name: { in: verifyNames } },
          data: { verified_at: new Date() },
        });
      }

      for (const { name, version, current } of toChange) {
        const baseName = `base${name}`;
        await tx.toolVersion.upsert({
          where: { name: baseName },
          create: {
            name: baseName,
            version: current.version,
            added_at: current.added_at ?? new Date(),
            verified_at: new Date(),
          },
          update: { version: current.version, verified_at: new Date() },
        });
        await tx.toolVersion.update({
          where: { name },
          data: { version, added_at: new Date(), verified_at: new Date() },
        });
      }
    });
  }

  const elapsed = hrElapsed(start);
  return {
    elapsed,
    toCreate: toCreate.length,
    verifyNames: verifyNames.length,
    toChange: toChange.length,
  };
}

async function main() {
  const argv = parseArgs();
  if (argv.help) {
    console.log(
      "Usage: npx ts-node scripts/benchmark/toolVersionBenchmark.ts --count <N> --changes <M> [--apply]",
    );
    process.exit(0);
  }

  console.log("Connecting to DB...");
  await db.$connect();

  console.log(
    `Building ${argv.count} tool entries (with ${argv.changes} simulated changes)...`,
  );
  const toolEntries = await buildToolEntries(argv.count, argv.changes);
  console.log(`Prepared ${toolEntries.length} entries.`);

  console.log("\n=== Sequential (current) benchmark ===");
  const seqStart = nowMs();
  const seqResult = await sequentialBenchmark(toolEntries, argv.apply);
  console.log(`Sequential elapsed: ${seqResult.elapsed}`);
  console.log(
    `  creates: ${seqResult.creates}, verified: ${seqResult.verified}, changes: ${seqResult.changes}`,
  );

  console.log("\n=== Batched (proposed) benchmark ===");
  const batStart = nowMs();
  const batResult = await batchedBenchmark(toolEntries, argv.apply);
  console.log(`Batched elapsed: ${batResult.elapsed}`);
  console.log(
    `  toCreate: ${batResult.toCreate}, verifyNames: ${batResult.verifyNames}, toChange: ${batResult.toChange}`,
  );

  console.log("\nSummary:");
  console.log(`  Sequential: ${seqResult.elapsed}`);
  console.log(`  Batched:    ${batResult.elapsed}`);

  if (!argv.apply) {
    console.log(
      "\nNote: no writes were performed (dry-run). Run with --apply to execute writes.",
    );
  }

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
