/*
 * @FilePath: \my-new-app\test\__mocks__\prisma.ts
 * @LastEditTime: 2026-09-07 23:47:25
 */
export const db = {
  log: {
    create: vi.fn().mockResolvedValue({}),
  },
  config: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  flight: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  weather: {
    findMany: vi.fn().mockResolvedValue([]),
  },
};
