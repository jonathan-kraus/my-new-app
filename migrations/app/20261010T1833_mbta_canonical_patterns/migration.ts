#!/usr/bin/env -S node
import type { Contract as End } from "../../snapshots/16e629108914214aeac09fc13695dd1dc3b9034615cbf7d6787599b3d2e58d72/contract";
import endContract from "../../snapshots/16e629108914214aeac09fc13695dd1dc3b9034615cbf7d6787599b3d2e58d72/contract.json" with { type: "json" };
import type { Contract as Start } from "../../snapshots/656655d9f264ca30e08ad333627ff618335eed59d37047e4ea2067164c6b0dae/contract";
import startContract from "../../snapshots/656655d9f264ca30e08ad333627ff618335eed59d37047e4ea2067164c6b0dae/contract.json" with { type: "json" };
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
