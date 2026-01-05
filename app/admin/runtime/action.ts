"use server";

import { db } from "@/lib/db";

export async function updateConfig(key: string, value: string) {
  await db.runtimeConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function deleteConfig(key: string) {
  await db.runtimeConfig.delete({
    where: { key },
  });
}

export async function createConfig(key: string, value: string) {
  await db.runtimeConfig.create({
    data: { key, value },
  });
}
