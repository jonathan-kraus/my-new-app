#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/52aa337cc85ca87a41d7eb2a01a6fc272d1d5df038dfcbc6263a4c72603534a9/contract';
import startContract from '../../snapshots/52aa337cc85ca87a41d7eb2a01a6fc272d1d5df038dfcbc6263a4c72603534a9/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/74422139fc2ff8eeeacf9b62e85ea5606f8c53dc4570a36d07bb50162cc7807b/contract';
import endContract from '../../snapshots/74422139fc2ff8eeeacf9b62e85ea5606f8c53dc4570a36d07bb50162cc7807b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropIndex({
        schema: 'public',
        table: 'DbTableStats',
        index: 'DbTableStats_tableName_snapshotDate_idx',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
