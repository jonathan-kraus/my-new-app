import { neon } from "@neondatabase/serverless";
import { db8 } from "@/lib/db.prisma8";

import contract from "../../../generated/prisma8/contract.json" with {
  type: "json",
};

import { excludeTables } from "./utils";
import { timestampString } from "@/lib/timestampString";

// Explicitly registered collections keep dynamic table access typed and allowlisted.

const tables = {
  AstronomySnapshot: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.AstronomySnapshot
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.AstronomySnapshot.aggregate((a) => ({
        total: a.count(),
      })),
  },

  DbTableStats: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.DbTableStats
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.DbTableStats.aggregate((a) => ({
        total: a.count(),
      })),
  },

  EphemerisDebug: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.EphemerisDebug
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.EphemerisDebug.aggregate((a) => ({
        total: a.count(),
      })),
  },

  ForecastSnapshot: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.ForecastSnapshot
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.ForecastSnapshot.aggregate((a) => ({
        total: a.count(),
      })),
  },

  GithubEvent: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.GithubEvent
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.GithubEvent.aggregate((a) => ({
        total: a.count(),
      })),
  },

  Location: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.Location
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.Location.aggregate((a) => ({
        total: a.count(),
      })),
  },

  Log: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.Log
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.Log.aggregate((a) => ({
        total: a.count(),
      })),
  },

  Note: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.Note
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.Note.aggregate((a) => ({
        total: a.count(),
      })),
  },

  RuntimeConfig: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.RuntimeConfig
        .orderBy((row) => row.key.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.RuntimeConfig.aggregate((a) => ({
        total: a.count(),
      })),
  },

  ToolVersion: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.ToolVersion
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.ToolVersion.aggregate((a) => ({
        total: a.count(),
      })),
  },

  TravelSnapshot: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.TravelSnapshot
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.TravelSnapshot.aggregate((a) => ({
        total: a.count(),
      })),
  },

  TravelSegment: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.TravelSegment
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.TravelSegment.aggregate((a) => ({
        total: a.count(),
      })),
  },

  WeatherSnapshot: {
    rows: (offset: number, limit: number) =>
      db8.orm.public.WeatherSnapshot
        .orderBy((row) => row.id.desc())
        .offset(offset)
        .limit(limit)
        .all(),

    count: () =>
      db8.orm.public.WeatherSnapshot.aggregate((a) => ({
        total: a.count(),
      })),
  },
};

type TableName = keyof typeof tables;

type StorageColumn = {
  nativeType: string;
  nullable: boolean;
};

type StorageMetadata = {
  columns: Record<string, StorageColumn>;
};

type DomainMetadata = {
  storage: {
    fields: Record<string, { column: string }>;
  };
};

export function getModelForTable(tableName: string): TableName | null {
  if (
    excludeTables.includes(tableName) ||
    !Object.hasOwn(tables, tableName)
  ) {
    return null;
  }

  return tableName as TableName;
}

export async function getTableDataWithPrisma(
  tableName: string,
  page = 1,
  limit = 50,
) {
  const modelName = getModelForTable(tableName);

  if (!modelName) return null;

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    !Number.isSafeInteger((page - 1) * limit)
  ) {
    throw new Error("Invalid pagination");
  }

  const model = tables[modelName];

  const { total: totalRows } = await model.count();

  const records = await model.rows(
    (page - 1) * limit,
    limit,
  );

  const storage = contract.storage.namespaces.public.entries.table[
    modelName
  ] as StorageMetadata;

  const domain = contract.domain.namespaces.public.models[
    modelName
  ] as DomainMetadata;

  const columns = Object.entries(storage.columns).map(
    ([name, field]) => ({
      name,
      type: field.nativeType,
      nullable: field.nullable,
    }),
  );

  // Use database column names, serialize bigint losslessly,
  // and preserve UTC timestamps.
  const rows = records.map((record) =>
    Object.fromEntries(
      Object.entries(domain.storage.fields).map(
        ([field, mapping]) => {
          const column = storage.columns[mapping.column];

          let value: unknown = (
            record as unknown as Record<string, unknown>
          )[field];

          if (
            value != null &&
            column?.nativeType === "timestamp"
          ) {
            value = new Date(
              `${String(value)}Z`,
            ).toISOString();
          }

          if (typeof value === "bigint") {
            value = value.toString();
          }

          return [mapping.column, value];
        },
      ),
    ),
  );

  return {
    name: tableName,
    columns,
    rows,
    totalRows,
    page,
    limit,
    totalPages: Math.ceil(totalRows / limit),
  };
}

export async function getTableHistoryWithPrisma(
  tableName: string,
) {
  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30,
  );

  const thirtyDaysAgo8 = timestampString(
    thirtyDaysAgo.toISOString(),
  );

  const history = await db8.orm.public.DbTableStats
    .where({ tableName })
    .where((row) =>
      row.snapshotDate.gte(thirtyDaysAgo8),
    )
    .orderBy((row) => row.snapshotDate.asc())
    .all();

  return history.map((h) => ({
    tableName: h.tableName,
    rowEstimate: h.rowEstimate,
    totalBytes: Number(h.totalBytes),
    snapshotDate: h.snapshotDate,
  }));
}
