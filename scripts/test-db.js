import { db } from "@/lib/db";

async function main() {
  const result = await db.log.create({
    data: {
      level: "info",
      message: "Direct test",
      domain: "test",
      payload: {},
      meta: {},
    },
  });

  console.log("Success:", result);
}

main().catch((err) => {
  console.error("DB ERROR:", err);
});
