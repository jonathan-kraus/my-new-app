import { createId } from "@paralleldrive/cuid2";
import { Temporal } from "temporal-polyfill";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from "next-auth/adapters";
import type { Models } from "../../generated/prisma8/contract";
import { db8 } from "@/lib/db.prisma8";

// Postgres timestamp columns hold UTC wall-clock values; Auth.js expects Dates.
const toTimestamp = (date: Date) =>
  Temporal.Instant.from(date.toISOString())
    .toZonedDateTimeISO("UTC")
    .toPlainDateTime();
const toDate = (value: Temporal.PlainDateTime) =>
  new Date(value.toZonedDateTime("UTC").epochMilliseconds);

function toUser(
  row: Omit<Models.public_User, "accounts" | "sessions">,
): AdapterUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email!,
    image: row.image,
    emailVerified: row.emailVerified ? toDate(row.emailVerified) : null,
  };
}

function toSession(row: Omit<Models.public_Session, "user">): AdapterSession {
  return {
    sessionToken: row.sessionToken,
    userId: row.userId,
    expires: toDate(row.expires),
  };
}

function toAccount(row: Omit<Models.public_Account, "user">): AdapterAccount {
  return {
    userId: row.userId,
    type: row._type as AdapterAccount["type"],
    provider: row.provider,
    providerAccountId: row.providerAccountId,
    refresh_token: row.refreshToken ?? undefined,
    access_token: row.accessToken ?? undefined,
    expires_at: row.expiresAt ?? undefined,
    token_type: row.tokenType?.toLowerCase() as Lowercase<string> | undefined,
    scope: row.scope ?? undefined,
    id_token: row.idToken ?? undefined,
    session_state: row.sessionState ?? undefined,
  };
}

/** Auth.js adapter for the configured GitHub provider and database sessions. */
export function Prisma8Adapter(): Adapter {
  const { User, Account, Session } = db8.orm.public;
  return {
    async createUser(data) {
      return toUser(
        await User.create({
          id: createId(),
          name: data.name ?? null,
          email: data.email,
          image: data.image ?? null,
          emailVerified: data.emailVerified
            ? toTimestamp(data.emailVerified)
            : null,
        }),
      );
    },
    async getUser(id) {
      const row = await User.where({ id }).first();
      return row ? toUser(row) : null;
    },
    async getUserByEmail(email) {
      const row = await User.where({ email }).first();
      return row ? toUser(row) : null;
    },
    async getUserByAccount(key) {
      const row = await Account.where(key).include("user").first();
      return row?.user ? toUser(row.user) : null;
    },
    async updateUser({ id, ...data }) {
      const row = await User.where({ id }).update({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.emailVerified !== undefined && {
          emailVerified: data.emailVerified
            ? toTimestamp(data.emailVerified)
            : null,
        }),
      });
      if (!row) throw new Error("Auth user not found");
      return toUser(row);
    },
    async deleteUser(id) {
      // The current database uses RESTRICT foreign keys, so remove dependents first.
      await db8.transaction(async (tx) => {
        await tx.orm.public.Session.where({ userId: id }).delete();
        await tx.orm.public.Account.where({ userId: id }).delete();
        await tx.orm.public.User.where({ id }).delete();
      });
    },
    async linkAccount(data) {
      const row = await Account.create({
        id: createId(),
        userId: data.userId,
        _type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refreshToken: data.refresh_token ?? null,
        accessToken: data.access_token ?? null,
        expiresAt: data.expires_at ?? null,
        tokenType: data.token_type ?? null,
        scope: data.scope ?? null,
        idToken: data.id_token ?? null,
        sessionState:
          typeof data.session_state === "string" ? data.session_state : null,
      });
      return toAccount(row);
    },
    async getAccount(providerAccountId, provider) {
      const row = await Account.where({ providerAccountId, provider }).first();
      return row ? toAccount(row) : null;
    },
    async unlinkAccount(key) {
      await Account.where(key).delete();
    },
    async createSession(data) {
      return toSession(
        await Session.create({
          id: createId(),
          sessionToken: data.sessionToken,
          userId: data.userId,
          expires: toTimestamp(data.expires),
        }),
      );
    },
    async getSessionAndUser(sessionToken) {
      const row = await Session.where({ sessionToken }).include("user").first();
      return row?.user
        ? { session: toSession(row), user: toUser(row.user) }
        : null;
    },
    async updateSession({ sessionToken, ...data }) {
      const row = await Session.where({ sessionToken }).update({
        ...(data.userId !== undefined && { userId: data.userId }),
        ...(data.expires !== undefined && {
          expires: toTimestamp(data.expires),
        }),
      });
      return row ? toSession(row) : null;
    },
    async deleteSession(sessionToken) {
      await Session.where({ sessionToken }).delete();
    },
  };
}
