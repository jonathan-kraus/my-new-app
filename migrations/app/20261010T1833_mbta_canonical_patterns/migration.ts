#!/usr/bin/env -S node
import type { Contract as End } from "../../snapshots/31b969c03a8b3a4d1a4ab0aa742c1e0dbafe7ac5a4e5928fb5089b18bdc7cea4/contract";
import endContract from "../../snapshots/31b969c03a8b3a4d1a4ab0aa742c1e0dbafe7ac5a4e5928fb5089b18bdc7cea4/contract.json" with { type: "json" };
import type { Contract as Start } from "../../snapshots/7a928caa763c87b6ce3ae0136554818170f0c9241eb8269a4a5eaf8f39132ff2/contract";
import startContract from "../../snapshots/7a928caa763c87b6ce3ae0136554818170f0c9241eb8269a4a5eaf8f39132ff2/contract.json" with { type: "json" };
import { Migration, MigrationCLI, col } from "@prisma/orm-postgres/migration";

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: "public",
        table: "MbtaPattern",
        column: col("canonical", "bool", {
          codecRef: { codecId: "pg/bool@1" },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
