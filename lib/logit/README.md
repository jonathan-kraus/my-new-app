📘 README — logit Logging Module
Overview
logit is a dual‑write structured logging function designed for production‑grade observability.
It writes logs to:

Neon (Postgres) via Prisma

Axiom via direct ingestion

The function guarantees:

Stable schemas

Safe JSON serialization

No crashes if logging fails

Consistent identifiers (requestId, eventIndex)

Fully structured logs for both storage layers

This module is used across the entire application for server‑side logging, including API routes, background jobs, ingestion pipelines, and scheduled tasks.

🚀 Features
✔ Dual‑write logging
Writes to both:

Neon (db.log.create)

Axiom (axiomIngest)

✔ Schema‑safe
Payloads and metadata are flattened and serialized in a way that cannot break ingestion.

✔ Crash‑proof
If Neon or Axiom fail, the app continues running.

✔ Automatic identifiers
Every log entry includes:

requestId

eventIndex

domain

level

message

✔ JSON‑safe
Large or unserializable objects are automatically truncated or replaced with safe fallbacks.

📦 Requirements

1. Environment Variables
   Code
   AXIOM_DATASET=<your dataset>
   AXIOM_TOKEN=<your token>
   DATABASE_URL=<neon postgres url>
2. Prisma Schema Requirements
   Your Log model must include at least:

prisma
model Log {
id String @id @default(cuid())
createdAt DateTime @default(now())

domain String
level String
message String
requestId String

payload Json?
meta Json?

page String?
userId String?
data Json?
} 3. Axiom Dataset Schema
Axiom must allow:

domain (string)

level (string)

message (string)

eventIndex (number)

meta_json (stringified JSON)

payload_json (stringified JSON)

🧠 How It Works

1. Input
   ts
   logit(domain, event, payload, meta)
   Where:

domain — logical area of the app ("flight", "auth", "skybox", etc.)

event — { level, message }

payload — any structured data you want to log

meta — request context (page, userId, timestamps, etc.)

2. Flattening
   The logger builds two internal objects:

flatPayload
ts
{
eventIndex,
level,
message,
payload
}
flatMeta
ts
{
requestId,
page,
userId,
...meta
} 3. Neon Write
The logger writes a structured row to Postgres:

Safe JSON

Truncated if too large

Never throws (errors suppressed with cooldown)

4. Axiom Write
   The logger sends:

ts
{
domain,
eventIndex,
level,
message,
meta_json: "...",
payload_json: "..."
}
This ensures Axiom always receives valid, schema‑compatible strings.

📝 Sample Call
Here’s a real‑world example from your flight API:

ts
await logit(
"flight",
{ level: "info", message: "Fetched flight metadata" },
{
ident,
fa_flight_id: flightId,
scheduled_out: flight.scheduled_out,
},
{
page: "/api/fa/flight",
requestId,
userId,
}
);
🔧 Helper: Generate a Sample Call Automatically
If you want a built‑in helper that prints a sample call (useful for docs, debugging, or onboarding), add this to the bottom of your module:

ts
export function sampleLogitCall() {
return `await logit(
  "example",
  { level: "info", message: "Sample log event" },
  { foo: "bar", count: 123 },
  { page: "/example", userId: "demo-user" }
);
 `.trim();
}
Then you can do:

ts
console.log(sampleLogitCall());
Or expose it in a /api/debug/logit-sample route.

🧪 Testing
Local test:
ts
await logit(
"test",
{ level: "debug", message: "Testing logit" },
{ hello: "world" },
{ page: "/test" }
);
Check:

Neon → SELECT \* FROM Log ORDER BY createdAt DESC LIMIT 1;

Axiom → Query your dataset for domain == "test"
