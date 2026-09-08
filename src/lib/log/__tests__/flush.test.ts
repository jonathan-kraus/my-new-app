import { flush } from "@/lib/log/flush";

vi.mock("@axiomhq/js", () => {
  return {
    Axiom: class {
      ingest = vi.fn();
    },
  };
});

test("flush does not throw", async () => {
  await flush([{ domain: "test", dataj: {} }]);
});
