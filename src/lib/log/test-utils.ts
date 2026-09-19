// lib/log/test-utils.ts
export function fakeEvent(overrides: Record<string, unknown> = {}) {
  return {
    domain: "test",
    dataj: { ...overrides },
  };
}
