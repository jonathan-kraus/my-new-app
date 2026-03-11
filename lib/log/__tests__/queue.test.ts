import { enqueue, dequeueBatch, peek, clear } from "@/lib/log/queue";
import { fakeEvent } from "@/lib/log/test-utils";
beforeEach(clear);

test("enqueue and peek", () => {
  enqueue(fakeEvent({ a: 1 }));
  expect(peek()).toHaveLength(1);
});

test("dequeueBatch clears queue", () => {
  enqueue(fakeEvent({ a: 1 }));
  const batch = dequeueBatch();
  expect(batch).toHaveLength(1);
  expect(peek()).toHaveLength(0);
});
