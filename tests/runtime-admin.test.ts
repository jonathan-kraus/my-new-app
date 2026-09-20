import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  where: vi.fn().mockReturnThis(),
  first: vi.fn(),
}));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db.prisma8", () => ({
  db8: { orm: { public: { UserRole: mocks } } },
}));
import { requireRuntimeAdmin } from "@/lib/runtime/admin";

describe("runtime administrator authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an anonymous request without querying roles", async () => {
    mocks.auth.mockResolvedValue(null);
    await expect(requireRuntimeAdmin()).rejects.toMatchObject({ status: 401 });
    expect(mocks.where).not.toHaveBeenCalled();
  });

  it.each([null, { role: "user" }, { role: "Admin" }])(
    "rejects a user without the admin role: %j",
    async (role) => {
      mocks.auth.mockResolvedValue({ user: { email: "member@example.com" } });
      mocks.first.mockResolvedValue(role);
      await expect(requireRuntimeAdmin()).rejects.toMatchObject({
        status: 403,
      });
    },
  );

  it("checks the current server session against stored membership", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "owner@example.com" } });
    mocks.first.mockResolvedValue({ role: "admin" });
    await expect(requireRuntimeAdmin()).resolves.toBeUndefined();
    expect(mocks.where).toHaveBeenCalledWith({ email: "owner@example.com" });
  });

  it("fails closed when the role lookup fails", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "owner@example.com" } });
    mocks.first.mockRejectedValue(new Error("Database unavailable"));
    await expect(requireRuntimeAdmin()).rejects.toThrow("Database unavailable");
  });
});
