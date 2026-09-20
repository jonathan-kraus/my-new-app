import "server-only";

import { auth } from "@/auth";
import { db8 } from "@/lib/db.prisma8";

export class RuntimeAccessError extends Error {
  constructor(public readonly status: 401 | 403) {
    super(
      status === 401
        ? "Please sign in to manage settings."
        : "Administrator access is required.",
    );
    this.name = "RuntimeAccessError";
  }
}

export async function requireRuntimeAdmin() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new RuntimeAccessError(401);

  const membership = await db8.orm.public.UserRole.where({ email }).first();
  if (membership?.role !== "admin") throw new RuntimeAccessError(403);
}
