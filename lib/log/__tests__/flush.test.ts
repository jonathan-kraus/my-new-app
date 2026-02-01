import { flush } from "@/lib/log/flush";
import { vi } from "vitest";

vi.mock("@axiomhq/js", () => ({
  Axiom: vi.fn().mockImplementation(() => ({
    ingest: vi.fn(),
  })),
}));

test("flush does not throw", async () => {
  await flush([{ domain: "test", dataj: {} }]);
});
