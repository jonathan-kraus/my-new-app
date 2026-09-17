"use server";

import { db8 } from "@/lib/db.prisma8";

export type RuntimeValue = string | number | boolean;

const timestampString = (value: string) =>
  value as `${string}` & { readonly __timestampStringPrecision: 3 };

export async function getConfig(key: string, fallback?: RuntimeValue) {
  const row = await db8.orm.public.RuntimeConfig.where({
    key,
  }).first();

  if (!row) return fallback;

  return parseValue(row.value);
}

export async function setConfig(key: string, value: RuntimeValue) {
  const stringValue = String(value);
  const now = timestampString(new Date().toISOString());

  const row = await db8.orm.public.RuntimeConfig.upsert({
    create: {
      key,
      value: stringValue,
      updatedAt: now,
    },
    update: {
      value: stringValue,
      updatedAt: now,
    },
    conflictOn: {
      key,
    },
  });

  return parseValue(row.value);
}

export async function deleteConfig(key: string) {
  await db8.orm.public.RuntimeConfig.where({
    key,
  }).delete();
}

function parseValue(v: string): RuntimeValue {
  if (v === "true") return true;
  if (v === "false") return false;
  if (!isNaN(Number(v))) return Number(v);

  return v;
}
