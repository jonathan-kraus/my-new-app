#!/usr/bin/env -S node
import type { Contract as End } from "../../snapshots/f916aa31ca4b0033350dc3583937caf3a00d48fd7a116742955c2866322cca1d/contract";
import endContract from "../../snapshots/f916aa31ca4b0033350dc3583937caf3a00d48fd7a116742955c2866322cca1d/contract.json" with { type: "json" };
import {
  Migration,
  MigrationCLI,
  col,
  primaryKey,
} from "@prisma/orm-postgres/migration";

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: "public" }),
      this.createTable({
        schema: "public",
        table: "MbtaPattern",
        columns: [
          col("directionId", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("name", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("routeId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sortOrder", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("typicality", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        schema: "public",
        table: "MbtaPatternStop",
        columns: [
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("patternId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("position", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("stopId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        schema: "public",
        table: "MbtaRoute",
        columns: [
          col("attributes", "jsonb", {
            notNull: true,
            codecRef: { codecId: "pg/jsonb@1" },
          }),
          col("color", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("name", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("routeType", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("sortOrder", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("textColor", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        schema: "public",
        table: "MbtaStop",
        columns: [
          col("attributes", "jsonb", {
            notNull: true,
            codecRef: { codecId: "pg/jsonb@1" },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("latitude", "float8", { codecRef: { codecId: "pg/float8@1" } }),
          col("locationType", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("longitude", "float8", { codecRef: { codecId: "pg/float8@1" } }),
          col("name", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("parentStationId", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        schema: "public",
        table: "MbtaSyncState",
        columns: [
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("lastAttemptAt", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("lastError", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("lastSuccessAt", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("patternCount", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("routeCount", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("stopCount", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createIndex({
        schema: "public",
        table: "MbtaPattern",
        index: "MbtaPattern_routeId_idx_91ae2fd6",
        columns: ["routeId"],
      }),
      this.createIndex({
        schema: "public",
        table: "MbtaPatternStop",
        index: "MbtaPatternStop_patternId_idx_31993061",
        columns: ["patternId"],
      }),
      this.createIndex({
        schema: "public",
        table: "MbtaPatternStop",
        index: "MbtaPatternStop_patternId_position_idx_f5b2ee9d",
        columns: ["patternId", "position"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "MbtaPatternStop",
        index: "MbtaPatternStop_stopId_idx_8804d4e7",
        columns: ["stopId"],
      }),
      this.createIndex({
        schema: "public",
        table: "MbtaStop",
        index: "MbtaStop_parentStationId_idx_8eb11c00",
        columns: ["parentStationId"],
      }),
      this.addForeignKey({
        schema: "public",
        table: "MbtaPattern",
        foreignKey: {
          name: "MbtaPattern_routeId_fkey",
          columns: ["routeId"],
          references: { schema: "public", table: "MbtaRoute", columns: ["id"] },
          onDelete: "cascade",
          onUpdate: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "MbtaPatternStop",
        foreignKey: {
          name: "MbtaPatternStop_patternId_fkey",
          columns: ["patternId"],
          references: {
            schema: "public",
            table: "MbtaPattern",
            columns: ["id"],
          },
          onDelete: "cascade",
          onUpdate: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "MbtaPatternStop",
        foreignKey: {
          name: "MbtaPatternStop_stopId_fkey",
          columns: ["stopId"],
          references: { schema: "public", table: "MbtaStop", columns: ["id"] },
          onDelete: "restrict",
          onUpdate: "cascade",
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
