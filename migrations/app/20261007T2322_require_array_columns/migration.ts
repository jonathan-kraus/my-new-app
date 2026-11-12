#!/usr/bin/env -S node
import { Migration, MigrationCLI } from "@prisma/orm-postgres/migration";
import type { Contract as Start } from "../../snapshots/095c12ed1e8b26897e2a1e7573009635ae889450806cefb2db40a9c04c066e7a/contract";
import startContract from "../../snapshots/095c12ed1e8b26897e2a1e7573009635ae889450806cefb2db40a9c04c066e7a/contract.json" with {
  type: "json",
};
import type { Contract as End } from "../../snapshots/f27602ec8284d9ee15fd4f93e9a65d447b91cbb848c8ff27a5261cadcda27efc/contract";
import endContract from "../../snapshots/f27602ec8284d9ee15fd4f93e9a65d447b91cbb848c8ff27a5261cadcda27efc/contract.json" with {
  type: "json",
};

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
