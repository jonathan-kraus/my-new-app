import { beforeEach, describe, expect, it, vi } from "vitest";
import { Temporal } from "temporal-polyfill";
import { Prisma8Adapter } from "../src/lib/auth-prisma8-adapter";

const mocks = vi.hoisted(() => {
  const model = () => ({
    where: vi.fn().mockReturnThis(),
    include: vi.fn().mockReturnThis(),
    first: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  });
  const models = { User: model(), Account: model(), Session: model() };
  return {
    ...models,
    transaction: vi.fn(async (fn) => fn({ orm: { public: models } })),
  };
});

vi.mock("@/lib/db.prisma8", () => ({
  db8: { orm: { public: mocks }, transaction: mocks.transaction },
}));

const date = new Date("2026-09-18T21:12:13.456Z");
const timestamp = Temporal.PlainDateTime.from("2026-09-18T21:12:13.456");
const user = {
  id: "user-1",
  name: "Test",
  email: "test@example.com",
  image: null,
  emailVerified: timestamp,
};

describe("Prisma8Adapter", () => {
  beforeEach(() => vi.clearAllMocks());

  it("generates a user ID and converts verification dates to UTC timestamps", async () => {
    mocks.User.create.mockImplementation(async (row) => row);
    const result = await Prisma8Adapter().createUser!({
      ...user,
      id: "provider-id",
      emailVerified: date,
    });
    const input = mocks.User.create.mock.calls[0]![0];
    expect(input.id).toBeTruthy();
    expect(input.id).not.toBe("provider-id");
    expect(input.emailVerified.toString()).toBe(timestamp.toString());
    expect(result.emailVerified).toEqual(date);
  });

  it("maps OAuth token fields in both directions", async () => {
    mocks.Account.create.mockImplementation(async (row) => row);
    const account = {
      userId: user.id,
      type: "oauth" as const,
      provider: "github",
      providerAccountId: "42",
      access_token: "test-access",
      refresh_token: "test-refresh",
      expires_at: 123,
      token_type: "bearer" as const,
      scope: "read:user",
      id_token: "test-id",
      session_state: "state",
    };
    expect(await Prisma8Adapter().linkAccount!(account)).toEqual(account);
    expect(mocks.Account.create).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: "oauth",
        accessToken: "test-access",
        refreshToken: "test-refresh",
        expiresAt: 123,
        tokenType: "bearer",
        idToken: "test-id",
        sessionState: "state",
      }),
    );
  });

  it("returns database sessions and their user with JavaScript Dates", async () => {
    mocks.Session.first.mockResolvedValue({
      id: "s1",
      sessionToken: "token",
      userId: user.id,
      expires: timestamp,
      user,
    });
    const result = await Prisma8Adapter().getSessionAndUser!("token");
    expect(result?.session).toEqual({
      sessionToken: "token",
      userId: user.id,
      expires: date,
    });
    expect(result?.user.emailVerified).toEqual(date);
    expect(mocks.Session.where).toHaveBeenCalledWith({ sessionToken: "token" });
  });

  it("converts session creation and renewal dates without shifting time zones", async () => {
    mocks.Session.create.mockImplementation(async (row) => row);
    mocks.Session.update.mockImplementation(async (row) => ({
      sessionToken: "token",
      userId: user.id,
      ...row,
    }));
    const adapter = Prisma8Adapter();
    const session = { sessionToken: "token", userId: user.id, expires: date };
    expect(await adapter.createSession!(session)).toEqual(session);
    expect(
      await adapter.updateSession!({ sessionToken: "token", expires: date }),
    ).toEqual(session);
    expect(mocks.Session.update.mock.calls[0]![0].expires.toString()).toBe(
      timestamp.toString(),
    );
    expect(mocks.Session.update.mock.calls[0]![0]).not.toHaveProperty("userId");
  });

  it("preserves omitted user fields and supports clearing emailVerified", async () => {
    mocks.User.update.mockResolvedValue({ ...user, emailVerified: null });
    await Prisma8Adapter().updateUser!({ id: user.id, emailVerified: null });
    expect(mocks.User.update).toHaveBeenCalledWith({ emailVerified: null });
  });

  it("returns null for missing users, accounts, and sessions", async () => {
    mocks.User.first.mockResolvedValue(undefined);
    mocks.Account.first.mockResolvedValue(undefined);
    mocks.Session.first.mockResolvedValue(undefined);
    mocks.Session.update.mockResolvedValue(null);
    const adapter = Prisma8Adapter();
    expect(await adapter.getUser!("missing")).toBeNull();
    expect(await adapter.getUserByEmail!("missing@example.com")).toBeNull();
    expect(
      await adapter.getUserByAccount!({
        provider: "github",
        providerAccountId: "missing",
      }),
    ).toBeNull();
    expect(await adapter.getAccount!("missing", "github")).toBeNull();
    expect(await adapter.getSessionAndUser!("missing")).toBeNull();
    expect(
      await adapter.updateSession!({ sessionToken: "missing", expires: date }),
    ).toBeNull();
  });

  it("deletes dependent sessions and accounts before the user in a transaction", async () => {
    await Prisma8Adapter().deleteUser!(user.id);
    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.Session.where).toHaveBeenCalledWith({ userId: user.id });
    expect(mocks.Account.where).toHaveBeenCalledWith({ userId: user.id });
    expect(mocks.User.where).toHaveBeenCalledWith({ id: user.id });
    expect(mocks.Session.delete.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.Account.delete.mock.invocationCallOrder[0]!,
    );
    expect(mocks.Account.delete.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.User.delete.mock.invocationCallOrder[0]!,
    );
  });
});
