# MBTA catalog

The main page is `/mbta`. `/green-c`, `/line`, and `/stops` redirect there;
`/line/[lineId]` still selects the requested line. Dean Road and Hynes Convention
Center are shortcuts. Stop details come from Neon; arrival predictions remain live.

The catalog currently covers MBTA subway and trolley routes (route types 0 and 1).
One stop record is stored per MBTA ID, with station/platform relationships and the
complete stop attributes. Ordered platform memberships belong to route patterns,
so directions and branches remain distinct. The station picker deduplicates each
pattern's platforms to their parent stations. It orders the typical outbound
pattern first, then appends stops unique to other patterns; it does not pretend
branched lines have a single linear stop order.

## Database setup

The MBTA catalog shares the application's Prisma 8 contract, connection pool,
and migration history. All current models live in `prisma8/contract.prisma`,
generated types in `generated/prisma8`, and migrations in `migrations/app`.
The CLI loads `.env.local` before `.env`, matching the Next.js development app.
Use the default configuration for all schema changes:

```sh
pnpm exec prisma contract emit
pnpm exec prisma migration plan --name describe_your_change
# Review the generated migration before applying it.
pnpm exec prisma db migrate --advance-ref db
```

Generated files, migration packages, snapshots, and the `db` ref are committed
together. The default `app` marker now describes the full application schema.
See [Neon schema adoption](neon-schema-adoption.md) for the historical checkpoint
and the one-time setup for another database that already contains these tables.

## Initial import and manual refresh

Set `DATABASE_URL` and optionally `MBTA_KEY` in the environment or `.env.local`.
The importer follows pagination, validates complete routes/patterns/parent stations,
and sends the API key in the `x-api-key` header.

```sh
# Fetch and validate without accessing or modifying the database.
pnpm exec tsx --conditions=react-server scripts/sync-mbta.ts --dry-run

# Load or replace the catalog in one database transaction.
pnpm exec tsx --conditions=react-server scripts/sync-mbta.ts
```

On Windows networks whose trusted CA is in the Windows certificate store, start
Node with `$env:NODE_USE_SYSTEM_CA = "1"` if certificate verification fails.

For signed-in administrators, `/admin/mbta` shows the last successful refresh,
counts and failures, and provides **Load MBTA data** / **Refresh MBTA data**.
It uses the existing `UserRole` admin check. POST requests also require a matching
Origin header. Status and refresh endpoints reject anonymous or non-admin callers.

All data pages must validate before publication. Catalog replacement uses one
transaction and an advisory lock; a write failure rolls back the entire catalog.
Readers take a shared lock so they never combine old and new table contents. An
older import cannot overwrite a newer refresh. A failed automatic/admin refresh
records a generic failure and retains the previous successful snapshot.

## Scheduled refresh

Use cron-job.org to call `https://www.kraus.my.id/api/cron/mbta` with GET once
daily, for example at **04:00 America/New_York**. Set a nonempty `CRON_SECRET`
in the Vercel production environment, and configure the job's custom header
`Authorization: Bearer YOUR_CRON_SECRET` using that same value. No request body
is needed. The endpoint refuses requests when the secret is missing or wrong.
Deploy the endpoint and environment variable before testing the external job;
a successful test returns HTTP 200.

The existing astronomy job remains the only schedule in `vercel.json`; MBTA
does not consume an additional Vercel cron slot.

Raw snapshots in S3 are optional and are not required by this implementation.
