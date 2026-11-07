#!/usr/bin/env -S node
import type { Contract as Start } from "../../snapshots/f27602ec8284d9ee15fd4f93e9a65d447b91cbb848c8ff27a5261cadcda27efc/contract";
import startContract from "../../snapshots/f27602ec8284d9ee15fd4f93e9a65d447b91cbb848c8ff27a5261cadcda27efc/contract.json" with { type: "json" };
import type { Contract as End } from "../../snapshots/656655d9f264ca30e08ad333627ff618335eed59d37047e4ea2067164c6b0dae/contract";
import endContract from "../../snapshots/656655d9f264ca30e08ad333627ff618335eed59d37047e4ea2067164c6b0dae/contract.json" with { type: "json" };
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
