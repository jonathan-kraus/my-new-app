# Unified Neon schema

`prisma8/contract.prisma` is the single current application contract, including
the five MBTA models. Both the application and MBTA service use `db8` from
`src/lib/db.prisma8.ts`, sharing its generated types and connection pool.
`prisma.config.ts` loads `.env.local` before `.env`; both CLI and Next.js must
point to the intended Neon branch when applying migrations.

## Migration history

The original MBTA migration and snapshot have been moved intact into `migrations/`.
The history is:

1. `20261007T1901_mbta_catalog`: creates the MBTA tables.
2. `20261007T2322_adopt_application_schema`: captures the pre-existing application
   tables, indexes, and relationships. This can create them in a new empty database.
3. `20261007T2322_require_array_columns`: sets `Note.tags` and
   `TravelSegment.seats` to `NOT NULL`. It checks for NULL values first and runs
   atomically; it does not backfill or delete data. If a different database contains
   NULL arrays, review that data before applying this migration.
4. `20261007T2334_preserve_legacy_migration_history`: declares the old
   `_prisma_migrations` table under create-if-absent (`tolerated`) ownership.
   Its guarded CREATE leaves existing history untouched and provides an empty
   history table for fresh databases. The old SQL files in `prisma/migrations`
   remain historical records; only `migrations/` is used for new migrations.

`ToolVersion.name` uses its existing `ToolVersion_name_key` unique index.
The redundant field-level unique constraint was removed from the contract;
the database's uniqueness guarantee remains in place.

## Existing database adoption

The configured Neon database has already been adopted and migrated. Its marker
and the committed `db` ref point to the full current contract. Do not repeat the
adoption commands there: the historical nullable-array snapshot is no longer its
current schema.

For a separate database that already contains the application and MBTA tables,
but still has the historical nullable arrays, use the immutable adoption snapshot:

```sh
pnpm exec prisma db verify --config prisma.adoption.config.ts --schema-only
pnpm exec prisma db sign --config prisma.adoption.config.ts --no-advance-ref
pnpm exec prisma db migrate --show
pnpm exec prisma db migrate
pnpm exec prisma db verify
```

The first two commands must succeed before proceeding. Signing verifies the
existing schema and records it as the adoption checkpoint without executing the
table-creation migrations. The preview must show `require_array_columns` and
`preserve_legacy_migration_history`.
The adoption config points to a frozen historical snapshot; never use it for
ordinary schema authoring or as the runtime contract.

For a new empty database, use the default `prisma db migrate` to replay the full
history. For an already matching full schema with a stale marker, use the default
`prisma db sign --no-advance-ref` after verification rather than the adoption config.

For an exact schema audit, `pnpm exec prisma db verify --strict` checks both the
marker and schema, including the retained legacy history table. The configured
Neon database passes this check with no drift, warnings, or unclaimed objects.

## Future schema changes

```sh
pnpm exec prisma contract emit
pnpm exec prisma migration plan --name describe_your_change
# Review migration.ts and ops.json; fill any generated data-transform placeholders.
pnpm exec prisma db migrate --show
pnpm exec prisma db migrate --advance-ref db
```

Keep the contract, generated artifacts, migration packages, snapshots, and the
updated `migrations/app/refs/db.json` together in version control. Deployments
should use `prisma db migrate` without advancing the development ref.
