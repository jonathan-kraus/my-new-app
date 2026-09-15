/*
 * @FilePath: \my-new-app\scripts\test-prisma8.ts
 * @LastEditTime: 2026-09-15 01:52:40
 */
import { db8 } from "../src/lib/db.prisma8";

async function main() {
  const rows = await db8.orm.public.Note.select(
    "id",
    "title",
    "tags",
    "content",
  )
    .limit(2)
    .all();

  console.dir(rows, { depth: null });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
