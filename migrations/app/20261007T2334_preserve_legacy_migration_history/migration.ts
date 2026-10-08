#!/usr/bin/env -S node
import type { Contract as Start } from "../../snapshots/275e5eb401e0f50193fcd3ac0146bd29fc847cdbe39cb1815c6edad6815ab3c3/contract";
import startContract from "../../snapshots/275e5eb401e0f50193fcd3ac0146bd29fc847cdbe39cb1815c6edad6815ab3c3/contract.json" with { type: "json" };
import type { Contract as End } from "../../snapshots/7a928caa763c87b6ce3ae0136554818170f0c9241eb8269a4a5eaf8f39132ff2/contract";
import endContract from "../../snapshots/7a928caa763c87b6ce3ae0136554818170f0c9241eb8269a4a5eaf8f39132ff2/contract.json" with { type: "json" };
import {
  Migration,
  MigrationCLI,
  rawSql,
} from "@prisma/orm-postgres/migration";

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      rawSql({
        id: "legacy-prisma-history.ensure-table",
        label:
          "Preserve existing Prisma history; create an empty table only if absent",
        operationClass: "additive",
        target: {
          id: "postgres",
          details: {
            schema: "public",
            objectType: "table",
            name: "_prisma_migrations",
          },
        },
        precheck: [],
        execute: [
          {
            description: "Create legacy history only for a fresh database",
            sql: `CREATE TABLE IF NOT EXISTS "public"."_prisma_migrations" (
            "id" character varying(36) NOT NULL,
            "checksum" character varying(64) NOT NULL,
            "finished_at" timestamptz,
            "migration_name" character varying(255) NOT NULL,
            "logs" text,
            "rolled_back_at" timestamptz,
            "started_at" timestamptz DEFAULT now() NOT NULL,
            "applied_steps_count" int4 DEFAULT 0 NOT NULL,
            CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
          )`,
          },
        ],
        postcheck: [
          {
            description: "Verify the preserved history table exists",
            sql: "SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS result",
          },
        ],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
