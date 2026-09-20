import { describe, it, expect, vi, beforeEach } from "vitest";
import type * as RuntimeAdmin from "@/lib/runtime/admin";
vi.mock("@/lib/runtime/admin", async (importOriginal) => ({
  ...(await importOriginal<typeof RuntimeAdmin>()),
  requireRuntimeAdmin: vi.fn(),
}));
vi.mock("@/auth", () => ({ auth: vi.fn() }));
import { requireRuntimeAdmin, RuntimeAccessError } from "@/lib/runtime/admin";

vi.mock("@/lib/db.prisma8", () => {
  const mockDb8 = {
    orm: {
      public: {
        RuntimeConfig: {
          orderBy: vi.fn().mockReturnThis(),
          all: vi.fn().mockResolvedValue([]),
        },
      },
    },
  };

  return { db8: mockDb8 };
});

const { db8 } = await import("@/lib/db.prisma8");
const mockedDb8 = vi.mocked(db8, true);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireRuntimeAdmin).mockResolvedValue(undefined);

  mockedDb8.orm.public.RuntimeConfig.orderBy.mockReturnValue(
    mockedDb8.orm.public.RuntimeConfig,
  );
});

describe("GET /api/admin/runtime", () => {
  it.each([401, 403] as const)(
    "rejects access with %s before reading settings",
    async (status) => {
      vi.mocked(requireRuntimeAdmin).mockRejectedValue(
        new RuntimeAccessError(status),
      );
      const { GET } = await import("../route");
      const res = await GET();
      expect(res.status).toBe(status);
      expect(mockedDb8.orm.public.RuntimeConfig.all).not.toHaveBeenCalled();
    },
  );
  it("returns an empty list when no configs exist", async () => {
    mockedDb8.orm.public.RuntimeConfig.all.mockResolvedValue([]);

    const { GET } = await import("../route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.configs).toEqual([]);
  });

  it("returns configs mapped to key/value and requests DB ordering", async () => {
    const mocked = [
      {
        key: "z.alpha",
        value: "3",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: "a.beta",
        value: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: "m.gamma",
        value: "2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockedDb8.orm.public.RuntimeConfig.all.mockResolvedValue(
      mocked as unknown as Awaited<
        ReturnType<typeof db8.orm.public.RuntimeConfig.all>
      >,
    );

    const { GET } = await import("../route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(mockedDb8.orm.public.RuntimeConfig.orderBy).toHaveBeenCalled();

    expect(json.configs).toEqual(
      mocked.map((c) => ({ key: c.key, value: c.value })),
    );
  });
});
