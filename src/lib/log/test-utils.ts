// lib/log/test-utils.ts
export function fakeEvent(overrides: any = {}) {
  return {
    domain: "test",
    dataj: { ...overrides },
  };
}
