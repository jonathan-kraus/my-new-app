#!/usr/bin/env -S node
import { Migration, MigrationCLI } from "@prisma/orm-postgres/migration";
import type { Contract as Start } from "../../snapshots/16e629108914214aeac09fc13695dd1dc3b9034615cbf7d6787599b3d2e58d72/contract";
import startContract from "../../snapshots/16e629108914214aeac09fc13695dd1dc3b9034615cbf7d6787599b3d2e58d72/contract.json" with {
  type: "json",
};
import type { Contract as End } from "../../snapshots/52aa337cc85ca87a41d7eb2a01a6fc272d1d5df038dfcbc6263a4c72603534a9/contract";
import endContract from "../../snapshots/52aa337cc85ca87a41d7eb2a01a6fc272d1d5df038dfcbc6263a4c72603534a9/contract.json" with {
  type: "json",
};

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [];
  }
}

MigrationCLI.run(import.meta.url, M);
