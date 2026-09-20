import { db8 } from "../src/lib/db.prisma8";

async function main() {
  const userId = process.argv[2];
  if (!userId)
    throw new Error(
      "Usage: pnpm exec tsx scripts/grant-runtime-admin.ts <user-id>",
    );

  await db8.transaction(async (tx) => {
    const user = await tx.orm.public.User.where({ id: userId }).first();
    if (!user?.email)
      throw new Error(
        "The specified user must exist and have an email address.",
      );
    await tx.orm.public.UserRole.upsert({
      conflictOn: { email: user.email },
      create: { email: user.email, role: "admin" },
      update: { role: "admin" },
    });
    const membership = await tx.orm.public.UserRole.where({
      email: user.email,
    }).first();
    if (membership?.role !== "admin")
      throw new Error("Administrator membership verification failed.");
  });
  console.log(`Verified runtime administrator membership for user ${userId}.`);
}

main()
  .catch(() => {
    console.error(
      "Could not grant administrator access. Check the user ID and configured database connection.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await db8.close();
  });
