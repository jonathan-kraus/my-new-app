import { logit } from "@/lib/log/logit";
import { db } from "@/lib/db";
const eventIndex = 22;
const requestId = crypto.randomUUID();
vi.mock("@/lib/db", () => ({
  db: {
    log: {
      create: vi.fn(),
    },
  },
}));

test("logit handles db failure", async () => {
  (db.log.create as any).mockRejectedValue(new Error("fail"));
  await logit(
    "test",
    { message: "" },
    { eventIndex },
    {
      requestId: requestId,
      zulu: new Date().toISOString(),
      local: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
      }),
    },
  );
});
