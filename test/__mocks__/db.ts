/*
 * @FilePath: \my-new-app\test\__mocks__\db.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-11 17:32:13
 * @Description  :
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-05 03:04:52
 */
// test/__mocks__/db.ts

import { vi } from "vitest";

// A unified mock Prisma client that matches your real db shape
export const mockDb = {
  astronomySnapshot: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
  runtimeConfig: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  ephemerisDebug: {
    create: vi.fn(), // <-- THIS is the correct name
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};
