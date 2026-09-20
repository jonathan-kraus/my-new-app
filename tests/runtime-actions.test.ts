import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as RuntimeAdmin from "@/lib/runtime/admin";
const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  where: vi.fn().mockReturnThis(),
  first: vi.fn(),
  create: vi.fn(),
}));
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/runtime/admin", async (importOriginal) => ({
  ...(await importOriginal<typeof RuntimeAdmin>()),
  requireRuntimeAdmin: mocks.requireAdmin,
}));
vi.mock("@/lib/runtime/config", () => ({
  setConfig: mocks.set,
  deleteConfig: mocks.remove,
}));
vi.mock("@/lib/db.prisma8", () => ({
  db8: { orm: { public: { RuntimeConfig: mocks } } },
}));
import { RuntimeAccessError } from "@/lib/runtime/admin";
import {
  saveRuntimeSetting,
  createRuntimeSetting,
  deleteRuntimeSetting,
} from "@/lib/runtime/actions";
import { POST } from "../app/api/set-flight-id/route";

describe("runtime settings mutations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.where.mockReturnValue(mocks);
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.first.mockResolvedValue(null);
  });

  it.each([401, 403] as const)(
    "blocks all editor writes and flight updates with %s",
    async (status) => {
      mocks.requireAdmin.mockRejectedValue(new RuntimeAccessError(status));
      for (const result of [
        await saveRuntimeSetting({ key: "email_enabled", value: "1" }),
        await createRuntimeSetting({ key: "x", value: "1" }),
        await deleteRuntimeSetting("email_enabled"),
      ])
        expect(result.ok).toBe(false);
      const response = await POST(
        new Request("http://localhost/api/set-flight-id", {
          method: "POST",
          body: JSON.stringify({ ident: "AA123" }),
        }),
      );
      expect(response.status).toBe(status);
      expect(mocks.set).not.toHaveBeenCalled();
      expect(mocks.remove).not.toHaveBeenCalled();
      expect(mocks.create).not.toHaveBeenCalled();
      expect(mocks.where).not.toHaveBeenCalled();
    },
  );

  it.each([
    null,
    { key: " ", value: "1" },
    { key: "x", value: {} },
    { key: "x", value: " " },
    { key: "x", value: "a".repeat(10001) },
  ])("rejects invalid input without writing", async (input) => {
    expect((await saveRuntimeSetting(input)).ok).toBe(false);
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("preserves an explicitly saved string value", async () => {
    expect(
      await saveRuntimeSetting({ key: " flight-ID ", value: "00123" }),
    ).toEqual({ ok: true });
    expect(mocks.set).toHaveBeenCalledWith("flight-ID", "00123");
  });

  it("does not overwrite an existing setting when adding", async () => {
    mocks.first.mockResolvedValue({ key: "x", value: "old" });
    expect((await createRuntimeSetting({ key: "x", value: "new" })).ok).toBe(
      false,
    );
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("creates a new setting without an upsert", async () => {
    expect(await createRuntimeSetting({ key: "x", value: "1" })).toEqual({
      ok: true,
    });
    expect(mocks.create).toHaveBeenCalledWith({
      key: "x",
      value: "1",
      updatedAt: expect.any(String),
    });
  });

  it("reports database failures without exposing their details", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.set.mockRejectedValue(new Error("private connection details"));
    expect(await saveRuntimeSetting({ key: "x", value: "1" })).toEqual({
      ok: false,
      error: "Could not save the change. Please try again.",
    });
    log.mockRestore();
  });

  it("deletes only after authorization and key validation", async () => {
    expect((await deleteRuntimeSetting({ key: "x" })).ok).toBe(false);
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(await deleteRuntimeSetting("x")).toEqual({ ok: true });
    expect(mocks.remove).toHaveBeenCalledWith("x");
  });

  it("rejects invalid flight identifiers", async () => {
    const response = await POST(
      new Request("http://localhost/api/set-flight-id", {
        method: "POST",
        body: JSON.stringify({ ident: { bad: true } }),
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.set).not.toHaveBeenCalled();
  });
});
