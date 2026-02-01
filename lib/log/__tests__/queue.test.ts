import { enqueue, dequeueBatch, peek, clear } from "@/lib/log/queue";

describe("queue", () => {
  beforeEach(clear);

  test("enqueue and peek", () => {
    enqueue({ a: 1 });
    expect(peek()).toHaveLength(1);
  });

  test("dequeueBatch clears queue", () => {
    enqueue({ a: 1 });
    const batch = dequeueBatch();
    expect(batch).toHaveLength(1);
    expect(peek()).toHaveLength(0);
  });
});
