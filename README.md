This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

![alt text](https://codecov.io/gh/<jonathan-kraus>/<my-new-app>/graph/badge.svg?token=<token>)

## Schema Map

1. Prisma Models
   Location
   id: string

name: string

latitude: number

longitude: number

timezone: string

createdAt: Date

WeatherSnapshot
id

locationId

fetchedAt

createdAt

payload (validated weather JSON)

AstronomySnapshot
id

locationId

fetchedAt

createdAt

sunrise

sunset

moonrise

moonset

sunriseBlueStart

sunriseBlueEnd

sunriseGoldenStart

sunriseGoldenEnd

sunsetGoldenStart

sunsetGoldenEnd

sunsetBlueStart

sunsetBlueEnd

Log
id

level

message

file

data (JSON)

createdAt

2. Zod Schemas
   WeatherResponseSchema
   temperature

humidity

windSpeed

conditions

sunriseTime

sunsetTime

AstronomyResponseSchema
sunrise

sunset

moonrise

moonset

golden hour fields

RuntimeConfigSchema
emailEnabled

cacheMinutes

featureFlags

3. API Routes
   /api/weather
   Validates external API

Checks cache

Logs cache hits

Computes golden hour

Stores snapshot

Returns normalized strings

/api/astronomy
Fetches sunrise/sunset

Computes blue/golden hour

Stores AstronomySnapshot

Returns ISO strings

Reads/writes config

Validates with Zod

Logs changes

/api/admin/test-email
Sends MailerSend test email

Respects runtime toggle

/api/github/webhook
Validates signature

Logs events

Handles POST only

4. Hooks
   useNow
   Returns ticking Date

Drives all timelines

useSolarTimeline
Sunrise/sunset timeline

Next event

Countdown

Progress percent

useLunarTimeline
Moonrise/moonset timeline

Wrap‑around handling

Visibility window

useGoldenHourTimeline
Blue hour AM

Golden hour AM

Golden hour PM

Blue hour PM

Next event + countdown

5. UI Components
   SolarCard
   Sunrise

Sunset

Timeline

Progress bar

LunarCard
Moonrise

Moonset

Visibility window

Countdown

GoldenHourCard
Blue hour

Golden hour

Next event

Progress bar

AdminRuntimeConfig
Toggles

Optimistic updates

Live feedback

Dashboard
Time‑aware greeting

Blue palette harmony

Source indicators

6. Cache & Logging
   Cache Rules
   Current weather cache

Forecast cache

Astronomy cache

Cache window per type

Logging
Cache hits

API failures

Webhook events

Admin actions

Structured JSON logs

7. Data Flow (End‑to‑End)
   Weather Flow
   User loads dashboard

API checks cache

If stale → fetch external API

Validate with Zod

Store snapshot

Return normalized strings

UI cards render timelines

Astronomy Flow
Fetch sunrise/sunset

Compute golden/blue hour

Store snapshot

UI renders Solar/Lunar/GoldenHour cards

Admin Flow
User toggles config

Zod validates

DB updates

UI updates optimistically

## Getting Started

**Prisma config:** This project uses `prisma.config.ts` as the canonical Prisma configuration. The legacy `prisma.config.cjs` has been removed to avoid ambiguity — run `pnpm exec prisma generate` (or `pnpm install`, which runs `prisma generate` via `postinstall`) to regenerate the Prisma client.

**Logging:** Recent changes introduced a split between server and client logging to avoid bundling server-only code into client bundles. Key points:
- `lib/log/logit.ts` — server-side logger that writes structured logs to the DB and queues events for ingestion.
- `lib/log/logit.client.ts` — lightweight client-side logger that forwards client logs to `POST /api/logs`.
- `app/api/logs/route.ts` was added/updated to accept client log POSTs and forward them to the server logger.
- `lib/log/logit.ts` now ensures a sensible fallback message (e.g., `"GET /api/weather status=200"`) so logs aren't just the counter (like `"#1 "`).
- A maintenance script `scripts/patch-log-message.ts` can patch existing counter-only log messages in the DB.

**Temporary security fixes (pnpm overrides):** To address `pnpm audit` findings, this project temporarily uses `pnpm.overrides` in `package.json` to force patched versions of some transitive deps (e.g., `lodash: ^4.17.23`, `hono: ^4.11.7`). These overrides should be removed when upstream packages are updated.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
