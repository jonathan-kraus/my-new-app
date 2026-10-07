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

The MBTA catalog uses a separate Prisma 8 contract and migration directory so its
schema can be verified and migrated independently of existing application tables.
Both runtimes use the same `DATABASE_URL`. Use **the MBTA config** for every MBTA
schema command:

```sh
pnpm exec prisma contract emit --config prisma.mbta.config.ts
pnpm exec prisma db migrate --config prisma.mbta.config.ts
```

The generated files are committed under `generated/mbta`. Regenerate them whenever
`prisma8/mbta.prisma` changes. Keep the application contract in `prisma8/contract.prisma`
separate; the MBTA config's default `app` marker describes only the catalog contract.
Do not sign that marker with the unrelated application contract.

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

`vercel.json` schedules `/api/cron/mbta` daily at **08:00 UTC**. Set a nonempty
`CRON_SECRET` in the Vercel production environment; Vercel supplies it as the
Bearer token. The endpoint refuses requests when the secret is missing or wrong.
The schedule becomes active when this application change is deployed.

Raw snapshots in S3 are optional and are not required by this implementation.
