import { logit } from "@/lib/log/logit";
import { vi } from "vitest";
import { db } from "@/lib/db";

vi.spyOn(db.log, "create").mockRejectedValue(new Error("fail"));

test("logit handles db failure", async () => {
  await logit("test", { message: "" });
});
