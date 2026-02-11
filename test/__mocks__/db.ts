/*
 * @FilePath     : \my-new-app\test\__mocks__\db.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-11 17:32:13
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-11 18:07:40
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
  ephemerisDebugEvent: {
    create: vi.fn(),
  },
  // Prisma client lifecycle methods
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};
