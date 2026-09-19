/*
 * @FilePath: \my-new-app\vitest.setup.ts
 * @LastEditTime: 2026-09-07 23:57:39
 */
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: () => data,
    }),
  },
}));
