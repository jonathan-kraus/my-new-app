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
  await logit("test", { message: "" });
});
