import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { ingestTravelEmails } from "@/lib/travel/ingest/email-ingest";

const mocks = vi.hoisted(() => ({
  files: vi.fn(),
  read: vi.fn(),
  stat: vi.fn(),
  mime: vi.fn(),
  parse: vi.fn(),
  first: vi.fn(),
  snapshot: vi.fn(),
  segment: vi.fn(),
}));
vi.mock("fs", () => ({
  readdirSync: mocks.files,
  readFileSync: mocks.read,
  statSync: mocks.stat,
}));
vi.mock("mailparser", () => ({ simpleParser: mocks.mime }));
vi.mock("@/lib/travel/parser/aa", () => ({ parseAAEmail: mocks.parse }));
vi.mock("@/lib/log/logj", () => ({ logj: vi.fn() }));
vi.mock("@/lib/log/buildj", () => ({
  staticUniversalContext: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/lib/db.prisma8", () => ({
  db8: {
    orm: {
      public: {
        TravelSnapshot: {
          where: () => ({ first: mocks.first, update: mocks.snapshot }),
          create: mocks.snapshot,
        },
        TravelSegment: {
          create: mocks.segment,
          where: () => ({ delete: vi.fn() }),
        },
      },
    },
  },
}));

const parsed = {
  source: "AA_EMAIL",
  receivedAt: new Date("2026-09-19T12:00:00Z"),
  confirmationCode: "ABC123",
  issuedDate: "2026-09-18",
  rawHtml: "html",
  passengers: [{ name: "Test Passenger" }],
  payment: [{ label: "Total", amount: "$100" }],
  bags: [{ description: "checked", price: "$35" }],
  segments: [
    {
      date: "Sunday, September 20, 2026",
      departureAirport: "PHL",
      departureCity: "Philadelphia",
      departureTime: "12:00 PM",
      arrivalAirport: "TPA",
      arrivalCity: "Tampa",
      arrivalTime: "3:00 PM",
      flightNumber: "AA123",
      operatedBy: "AA",
      seats: ["1A"],
    },
  ],
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => { });
  mocks.files.mockReturnValue(["trip.eml"]);
  mocks.read.mockReturnValue("email");
  mocks.stat.mockReturnValue({ mtime: new Date() });
  mocks.mime.mockResolvedValue({ html: "html" });
  mocks.parse.mockReturnValue(parsed);
  mocks.first.mockResolvedValue(null);
  mocks.snapshot.mockResolvedValue({
    id: "snapshot-id",
    receivedAt: "2026-09-19T12:00:00",
  });
  mocks.segment.mockResolvedValue({});
});
afterEach(() => vi.restoreAllMocks());

it("stores JSON fields and linked segments within the same operation", async () => {
  const result = await ingestTravelEmails();
  expect(mocks.snapshot).toHaveBeenCalledWith(
    expect.objectContaining({
      id: expect.any(String),
      passengers: parsed.passengers,
      payment: parsed.payment,
      bags: parsed.bags,
      receivedAt: expect.any(Object), // Temporal.PlainDateTime
    }),
  );
  expect(mocks.segment).toHaveBeenCalledWith({
    ...parsed.segments[0],
    id: expect.any(String),
    snapshotId: "snapshot-id",
  });
  expect(result?.receivedAt).toEqual(parsed.receivedAt);
});

it("skips inserts for an existing confirmation code", async () => {
  mocks.first.mockResolvedValue({
    id: "existing",
    receivedAt: "2026-09-19T12:00:00",
  });
  const result = await ingestTravelEmails();
  expect(result?.id).toBe("existing");
  expect(mocks.snapshot).toHaveBeenCalledTimes(1); // Updated, not created
});

it("propagates a failed segment write to the operation boundary", async () => {
  mocks.segment.mockRejectedValue(new Error("segment failed"));
  await expect(ingestTravelEmails()).rejects.toThrow("segment failed");
});
