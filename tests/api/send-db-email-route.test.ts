import { beforeEach, expect, it, vi } from "vitest";
import { POST } from "../../app/api/db-tables/send-db-email/route";

const mocks = vi.hoisted(() => ({
  snapshot: {
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    first: vi.fn(),
  },
  send: vi.fn().mockResolvedValue({}),
  email: vi.fn().mockReturnValue(null),
}));
vi.mock("@/lib/db.prisma8", () => ({
  db8: { orm: { public: { WeatherSnapshot: mocks.snapshot } } },
}));
vi.mock("@/lib/getTopTables", () => ({
  getTopTables: vi.fn().mockResolvedValue([{ name: "Log", count: 12 }]),
}));
vi.mock("@/lib/log/logj", () => ({ logj: vi.fn() }));
vi.mock("@/lib/log/build-universal-context", () => ({
  buildUniversalContext: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/emails/TopTablesEmail", () => ({ default: mocks.email }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));

beforeEach(() => vi.clearAllMocks());
const request = () =>
  new Request("http://localhost/api/db-tables/send-db-email", {
    method: "POST",
    body: JSON.stringify({ to: "test@example.com", firstName: "Test" }),
  });

it("renders the selected weather with a UTC timestamp and sends via the mocked email client", async () => {
  mocks.snapshot.first.mockResolvedValue({
    temperature: 72,
    fetchedAt: "2026-09-18 21:12:13.456",
  });
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(mocks.snapshot.where).toHaveBeenCalledWith({ locationId: "KOP" });
  const desc = vi.fn().mockReturnValue("descending");
  expect(
    mocks.snapshot.orderBy.mock.calls[0]![0]({ fetchedAt: { desc } }),
  ).toBe("descending");
  expect(mocks.email).toHaveBeenCalledWith(
    expect.objectContaining({
      weatherSnapshot: {
        temperature: 72,
        fetchedAt: "2026-09-18T21:12:13.456Z",
      },
      db1: "Log",
      ct1: 12,
      db2: "N/A",
      ct2: 0,
    }),
  );
  expect(mocks.send).toHaveBeenCalledWith(
    expect.objectContaining({
      to: "test@example.com",
      subject: "Top 5 Tables",
    }),
  );
});

it("renders the email without weather when no snapshot exists", async () => {
  mocks.snapshot.first.mockResolvedValue(null);
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(mocks.email).toHaveBeenCalledWith(
    expect.objectContaining({ weatherSnapshot: null }),
  );
  expect(mocks.send).toHaveBeenCalledOnce();
});
