import { db } from "@/lib/db";
import { excludeTables } from "./utils";

// Map table names to Prisma model names
const tableToModelMap: Record<string, string> = {
  Account: "account",
  AstronomySnapshot: "astronomySnapshot",
  DbTableStats: "dbTableStats",
  EphemerisDebug: "ephemerisDebug",
  ForecastSnapshot: "forecastSnapshot",
  GithubEvent: "githubEvent",
  Location: "location",
  Log: "log",
  Note: "note",
  RuntimeConfig: "runtimeConfig",
  Session: "session",
  ToolVersion: "toolVersion",
  TravelSnapshot: "travelSnapshot",
  TravelSegment: "travelSegment",
  User: "user",
  UserRole: "userRole",
  Verification: "verification",
  VerificationToken: "verificationToken",
  WeatherSnapshot: "weatherSnapshot",
};

export function getModelForTable(tableName: string): string | null {
  if (excludeTables.includes(tableName)) {
    return null;
  }
  return tableToModelMap[tableName] || null;
}

export async function getTableDataWithPrisma(
  tableName: string,
  page: number = 1,
  limit: number = 50,
) {
  const modelName = getModelForTable(tableName);
  if (!modelName) {
    return null;
  }

  // Dynamic access to Prisma model
  const model = (db as any)[modelName];

  if (!model) {
    return null;
  }

  // Get total count
  const totalRows = await model.count();

  // Get data with pagination
  const offset = (page - 1) * limit;
  const records = await model.findMany({
    take: limit,
    skip: offset,
    orderBy: { id: "desc" },
  });

  // Get column info from Prisma model
  const modelFields = model.model.fields;
  const columns = Object.values(modelFields).map((field: any) => ({
    name: field.name,
    type: field.type,
    nullable: field.isNullable,
  }));

  return {
    name: tableName,
    columns,
    rows: records,
    totalRows,
    page,
    limit,
    totalPages: Math.ceil(totalRows / limit),
  };
}

export async function getTableHistoryWithPrisma(tableName: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const history = await db.dbTableStats.findMany({
    where: {
      tableName,
      snapshotDate: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      snapshotDate: "asc",
    },
  });

  return history.map((h) => ({
    tableName: h.tableName,
    rowEstimate: h.rowEstimate,
    totalBytes: Number(h.totalBytes),
    snapshotDate: h.snapshotDate.toISOString(),
  }));
}
