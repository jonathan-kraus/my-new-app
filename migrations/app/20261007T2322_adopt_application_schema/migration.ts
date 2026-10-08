#!/usr/bin/env -S node
import type { Contract as End } from "../../snapshots/2ad2cc87de48ba7f1789e861ab63a9f3c13e78430786da2aa8046ee90d18e572/contract";
import endContract from "../../snapshots/2ad2cc87de48ba7f1789e861ab63a9f3c13e78430786da2aa8046ee90d18e572/contract.json" with { type: "json" };
import type { Contract as Start } from "../../snapshots/f916aa31ca4b0033350dc3583937caf3a00d48fd7a116742955c2866322cca1d/contract";
import startContract from "../../snapshots/f916aa31ca4b0033350dc3583937caf3a00d48fd7a116742955c2866322cca1d/contract.json" with { type: "json" };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
} from "@prisma/orm-postgres/migration";

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: "public",
        table: "Account",
        columns: [
          col("access_token", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("expires_at", "int4", { codecRef: { codecId: "pg/int4@1" } }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("id_token", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("provider", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("providerAccountId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("refresh_token", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("scope", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("session_state", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("token_type", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("type", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("userId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "Account_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "AstronomySnapshot",
        columns: [
          col("dateString", "character varying(10)", {
            notNull: true,
            codecRef: { codecId: "sql/varchar@1", typeParams: { length: 10 } },
          }),
          col("fetchedAt", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("illumination", "float8", {
            codecRef: { codecId: "pg/float8@1" },
          }),
          col("locationId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("moonPhase", "float8", { codecRef: { codecId: "pg/float8@1" } }),
          col("moonrise", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("moonset", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("phaseName", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("solarNoon", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("sunrise", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunriseBlueEnd", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("sunriseBlueStart", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunriseGoldenEnd", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunriseGoldenStart", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunset", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunsetBlueEnd", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("sunsetBlueStart", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunsetGoldenEnd", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunsetGoldenStart", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "AstronomySnapshot_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "DbTableStats",
        columns: [
          col("createdAt", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("indexBytes", "int8", {
            notNull: true,
            codecRef: { codecId: "pg/int8@1" },
          }),
          col("rowEstimate", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("snapshotDate", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("tableBytes", "int8", {
            notNull: true,
            codecRef: { codecId: "pg/int8@1" },
          }),
          col("tableName", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("toastBytes", "int8", {
            notNull: true,
            codecRef: { codecId: "pg/int8@1" },
          }),
          col("totalBytes", "int8", {
            notNull: true,
            codecRef: { codecId: "pg/int8@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "DbTableStats_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "EphemerisDebug",
        columns: [
          col("createdAt", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("date", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("fetchedAt", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("locationId", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("moonPhase", "float8", { codecRef: { codecId: "pg/float8@1" } }),
          col("moonrise", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("moonset", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("raw", "jsonb", {
            notNull: true,
            codecRef: { codecId: "pg/jsonb@1" },
          }),
          col("receivedAt", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("sunrise", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("sunriseBlueEnd", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("sunriseBlueStart", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunriseGoldenEnd", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunriseGoldenStart", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunset", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("sunsetBlueEnd", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("sunsetBlueStart", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunsetGoldenEnd", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sunsetGoldenStart", "text", {
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "EphemerisDebug_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "ForecastSnapshot",
        columns: [
          col("fetchedAt", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("locationId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("payload", "jsonb", {
            notNull: true,
            codecRef: { codecId: "pg/jsonb@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "ForecastSnapshot_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "GithubEvent",
        columns: [
          col("actor", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("commitMessage", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("commitSha", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("conclusion", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("createdAt", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("eventId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("jobName", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("raw", "jsonb", { codecRef: { codecId: "pg/jsonb@1" } }),
          col("repo", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("status", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("title", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("type", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("updatedAt", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("url", "text", { codecRef: { codecId: "pg/text@1" } }),
        ],
        constraints: [primaryKey(["id"], { name: "GithubEvent_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "Location",
        columns: [
          col("createdAt", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("isDefault", "bool", {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: "pg/bool@1" },
          }),
          col("key", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("latitude", "float8", {
            notNull: true,
            codecRef: { codecId: "pg/float8@1" },
          }),
          col("longitude", "float8", {
            notNull: true,
            codecRef: { codecId: "pg/float8@1" },
          }),
          col("name", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("timezone", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("updatedAt", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "Location_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "Log",
        columns: [
          col("created_at", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("domain", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("file", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("id", "SERIAL", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("level", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("line", "int4", { codecRef: { codecId: "pg/int4@1" } }),
          col("message", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("meta", "jsonb", { codecRef: { codecId: "pg/jsonb@1" } }),
          col("payload", "jsonb", {
            notNull: true,
            codecRef: { codecId: "pg/jsonb@1" },
          }),
          col("requestId", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("sessionEmail", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("sessionUser", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("userId", "text", { codecRef: { codecId: "pg/text@1" } }),
        ],
        constraints: [primaryKey(["id"], { name: "Log_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "Note",
        columns: [
          col("color", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("content", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("createdAt", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("followUpAt", "timestamp(3)", {
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("isArchived", "bool", {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: "pg/bool@1" },
          }),
          col("isCompleted", "bool", {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: "pg/bool@1" },
          }),
          col("pinned", "bool", {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: "pg/bool@1" },
          }),
          col("tags", "text[]", {
            default: lit([]),
            codecRef: { codecId: "pg/text@1", many: true },
          }),
          col("title", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("updatedAt", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("userEmail", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("userId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "Note_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "RuntimeConfig",
        columns: [
          col("createdAt", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("key", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("updatedAt", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("value", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["key"], { name: "RuntimeConfig_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "Session",
        columns: [
          col("expires", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("sessionToken", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("userId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "Session_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "ToolVersion",
        columns: [
          col("added_at", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("id", "SERIAL", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("name", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("verified_at", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("version", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "ToolVersion_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "TravelSegment",
        columns: [
          col("arrivalAirport", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("arrivalCity", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("arrivalTime", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("cabin", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("date", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("departureAirport", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("departureCity", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("departureTime", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("fareClass", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("flightNumber", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("marketedAs", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("operatedBy", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("seats", "text[]", {
            codecRef: { codecId: "pg/text@1", many: true },
          }),
          col("snapshotId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "TravelSegment_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "TravelSnapshot",
        columns: [
          col("bags", "jsonb", {
            notNull: true,
            codecRef: { codecId: "pg/jsonb@1" },
          }),
          col("confirmationCode", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("issuedDate", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("passengers", "jsonb", {
            notNull: true,
            codecRef: { codecId: "pg/jsonb@1" },
          }),
          col("payment", "jsonb", {
            notNull: true,
            codecRef: { codecId: "pg/jsonb@1" },
          }),
          col("rawHtml", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("receivedAt", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("source", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "TravelSnapshot_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "User",
        columns: [
          col("email", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("emailVerified", "timestamp(3)", {
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("image", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("name", "text", { codecRef: { codecId: "pg/text@1" } }),
        ],
        constraints: [primaryKey(["id"], { name: "User_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "UserRole",
        columns: [
          col("email", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("role", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["email"], { name: "UserRole_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "VerificationToken",
        columns: [
          col("expires", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("identifier", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("token", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
      }),
      this.createTable({
        schema: "public",
        table: "WeatherSnapshot",
        columns: [
          col("feelsLike", "float8", { codecRef: { codecId: "pg/float8@1" } }),
          col("fetchedAt", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-string@1",
              typeParams: { precision: 3 },
            },
          }),
          col("humidity", "float8", { codecRef: { codecId: "pg/float8@1" } }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("locationId", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("pressure", "float8", { codecRef: { codecId: "pg/float8@1" } }),
          col("temperature", "float8", {
            notNull: true,
            codecRef: { codecId: "pg/float8@1" },
          }),
          col("visibility", "float8", { codecRef: { codecId: "pg/float8@1" } }),
          col("weatherCode", "int4", { codecRef: { codecId: "pg/int4@1" } }),
          col("windDirection", "float8", {
            codecRef: { codecId: "pg/float8@1" },
          }),
          col("windSpeed", "float8", { codecRef: { codecId: "pg/float8@1" } }),
        ],
        constraints: [primaryKey(["id"], { name: "WeatherSnapshot_pkey" })],
      }),
      this.createTable({
        schema: "public",
        table: "verification",
        columns: [
          col("createdAt", "timestamp(3)", {
            notNull: true,
            default: fn("now()"),
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("expiresAt", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("id", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("identifier", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("updatedAt", "timestamp(3)", {
            notNull: true,
            codecRef: {
              codecId: "pg/timestamp-temporal@1",
              typeParams: { precision: 3 },
            },
          }),
          col("value", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
        ],
        constraints: [primaryKey(["id"], { name: "verification_pkey" })],
      }),
      this.createIndex({
        schema: "public",
        table: "Account",
        index: "Account_provider_providerAccountId_key",
        columns: ["provider", "providerAccountId"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "AstronomySnapshot",
        index: "AstronomySnapshot_locationId_dateString_key",
        columns: ["locationId", "dateString"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "DbTableStats",
        index: "DbTableStats_tableName_snapshotDate_idx",
        columns: ["tableName", "snapshotDate"],
      }),
      this.createIndex({
        schema: "public",
        table: "DbTableStats",
        index: "DbTableStats_tableName_snapshotDate_key",
        columns: ["tableName", "snapshotDate"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "GithubEvent",
        index: "GithubEvent_eventId_key",
        columns: ["eventId"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "Location",
        index: "Location_key_key",
        columns: ["key"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "Log",
        index: "Log_created_at_idx",
        columns: ["created_at"],
      }),
      this.createIndex({
        schema: "public",
        table: "Log",
        index: "Log_domain_idx",
        columns: ["domain"],
      }),
      this.createIndex({
        schema: "public",
        table: "Log",
        index: "Log_file_idx",
        columns: ["file"],
      }),
      this.createIndex({
        schema: "public",
        table: "Log",
        index: "Log_level_idx",
        columns: ["level"],
      }),
      this.createIndex({
        schema: "public",
        table: "Log",
        index: "Log_meta_idx",
        columns: ["meta"],
        extras: { type: "gin" },
      }),
      this.createIndex({
        schema: "public",
        table: "Log",
        index: "Log_payload_idx",
        columns: ["payload"],
        extras: { type: "gin" },
      }),
      this.createIndex({
        schema: "public",
        table: "Log",
        index: "Log_requestId_idx",
        columns: ["requestId"],
      }),
      this.createIndex({
        schema: "public",
        table: "Log",
        index: "Log_sessionEmail_idx",
        columns: ["sessionEmail"],
      }),
      this.createIndex({
        schema: "public",
        table: "Log",
        index: "Log_sessionUser_idx",
        columns: ["sessionUser"],
      }),
      this.createIndex({
        schema: "public",
        table: "Log",
        index: "Log_userId_idx",
        columns: ["userId"],
      }),
      this.createIndex({
        schema: "public",
        table: "Note",
        index: "Note_followUpAt_idx",
        columns: ["followUpAt"],
      }),
      this.createIndex({
        schema: "public",
        table: "Note",
        index: "Note_isArchived_idx",
        columns: ["isArchived"],
      }),
      this.createIndex({
        schema: "public",
        table: "Note",
        index: "Note_isCompleted_idx",
        columns: ["isCompleted"],
      }),
      this.createIndex({
        schema: "public",
        table: "Note",
        index: "Note_userEmail_idx",
        columns: ["userEmail"],
      }),
      this.createIndex({
        schema: "public",
        table: "Note",
        index: "Note_userId_idx",
        columns: ["userId"],
      }),
      this.createIndex({
        schema: "public",
        table: "Session",
        index: "Session_sessionToken_key",
        columns: ["sessionToken"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "ToolVersion",
        index: "ToolVersion_name_key",
        columns: ["name"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "TravelSnapshot",
        index: "TravelSnapshot_confirmationCode_key",
        columns: ["confirmationCode"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "TravelSnapshot",
        index: "TravelSnapshot_receivedAt_idx",
        columns: ["receivedAt"],
      }),
      this.createIndex({
        schema: "public",
        table: "User",
        index: "User_email_key",
        columns: ["email"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "VerificationToken",
        index: "VerificationToken_identifier_token_key",
        columns: ["identifier", "token"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "VerificationToken",
        index: "VerificationToken_token_key",
        columns: ["token"],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: "public",
        table: "WeatherSnapshot",
        index: "WeatherSnapshot_locationId_fetchedAt_idx",
        columns: ["locationId", "fetchedAt"],
      }),
      this.createIndex({
        schema: "public",
        table: "verification",
        index: "verification_identifier_idx",
        columns: ["identifier"],
      }),
      this.addForeignKey({
        schema: "public",
        table: "Account",
        foreignKey: {
          name: "Account_userId_fkey",
          columns: ["userId"],
          references: { schema: "public", table: "User", columns: ["id"] },
          onDelete: "restrict",
          onUpdate: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "AstronomySnapshot",
        foreignKey: {
          name: "AstronomySnapshot_locationId_fkey",
          columns: ["locationId"],
          references: { schema: "public", table: "Location", columns: ["id"] },
          onDelete: "restrict",
          onUpdate: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "ForecastSnapshot",
        foreignKey: {
          name: "ForecastSnapshot_locationId_fkey",
          columns: ["locationId"],
          references: { schema: "public", table: "Location", columns: ["id"] },
          onDelete: "restrict",
          onUpdate: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "Session",
        foreignKey: {
          name: "Session_userId_fkey",
          columns: ["userId"],
          references: { schema: "public", table: "User", columns: ["id"] },
          onDelete: "restrict",
          onUpdate: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "TravelSegment",
        foreignKey: {
          name: "TravelSegment_snapshotId_fkey",
          columns: ["snapshotId"],
          references: {
            schema: "public",
            table: "TravelSnapshot",
            columns: ["id"],
          },
          onDelete: "restrict",
          onUpdate: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "WeatherSnapshot",
        foreignKey: {
          name: "WeatherSnapshot_locationId_fkey",
          columns: ["locationId"],
          references: { schema: "public", table: "Location", columns: ["id"] },
          onDelete: "cascade",
          onUpdate: "cascade",
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
