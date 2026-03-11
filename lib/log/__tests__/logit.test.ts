import { logit } from "@/lib/log/logit";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    log: {
      create: vi.fn(),
    },
  },
}));

test("logit handles db failure", async () => {
  (db.log.create as any).mockRejectedValue(new Error("fail"));
  await logit("test", { message: "" }, { eventIndex }, {
        requestId: ctx?.requestId ?? req?.id,
        zulu: new Date().toISOString(),
        local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      });
});
