#!/usr/bin/env -S node
import type { Contract as End } from "../../snapshots/275e5eb401e0f50193fcd3ac0146bd29fc847cdbe39cb1815c6edad6815ab3c3/contract";
import endContract from "../../snapshots/275e5eb401e0f50193fcd3ac0146bd29fc847cdbe39cb1815c6edad6815ab3c3/contract.json" with { type: "json" };
import type { Contract as Start } from "../../snapshots/2ad2cc87de48ba7f1789e861ab63a9f3c13e78430786da2aa8046ee90d18e572/contract";
import startContract from "../../snapshots/2ad2cc87de48ba7f1789e861ab63a9f3c13e78430786da2aa8046ee90d18e572/contract.json" with { type: "json" };
import { Migration, MigrationCLI } from "@prisma/orm-postgres/migration";

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      // Existing rows were checked for NULL. Fail atomically if another environment
      // has NULL arrays instead of silently changing its stored data.
      this.setNotNull({ schema: "public", table: "Note", column: "tags" }),
      this.setNotNull({
        schema: "public",
        table: "TravelSegment",
        column: "seats",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
