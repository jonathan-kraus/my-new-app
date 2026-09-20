import { beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  data: vi.fn(),
  history: vi.fn(),
  size: vi.fn(),
}));
vi.mock("@/lib/db/prisma-table", () => ({
  getTableDataWithPrisma: mocks.data,
  getTableHistoryWithPrisma: mocks.history,
}));
vi.mock("@/lib/db/overview", () => ({ getTableSize: mocks.size }));
vi.mock("@/lib/log/logj", () => ({ logj: vi.fn() }));
vi.mock("@/lib/log/buildj", () => ({
  staticUniversalContext: vi.fn(() => ({})),
}));
vi.mock("@/components/dashboard-header", () => ({
  DashboardHeader: () => null,
}));
vi.mock("@/components/table-detail-view", () => ({
  TableDetailView: () => null,
}));
vi.mock("@/components/table-history-chart", () => ({
  TableHistoryChart: () => null,
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
}));
import TablePage from "../app/admin/db/table/[name]/page";

const props = {
  params: Promise.resolve({ name: "GithubEvent" }),
  searchParams: Promise.resolve({}),
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.data.mockResolvedValue({
    name: "GithubEvent",
    columns: [],
    rows: [],
    totalRows: 30000,
    page: 1,
    totalPages: 600,
  });
  mocks.history.mockResolvedValue([
    {
      snapshotDate: "2026-09-19T12:00:00Z",
      totalBytes: 1024,
      rowEstimate: 30000,
      tableName: "GithubEvent",
    },
  ]);
  mocks.size.mockResolvedValue({
    totalBytes: 164208640,
    indexBytes: 4194304,
    tableBytes: 9437184,
  });
});

it("renders the current total size in MB instead of the placeholder or historical size", async () => {
  const html = renderToStaticMarkup(await TablePage(props));
  expect(mocks.size).toHaveBeenCalledWith("GithubEvent");
  expect(html).toContain("Total Size");
  expect(html).toContain("156.6 MB");
  expect(html).not.toContain("1 KB");
});

it("does not look up sizes for a table rejected by the data allowlist", async () => {
  mocks.data.mockResolvedValue(null);
  await expect(TablePage(props)).rejects.toThrow("not found");
  expect(mocks.size).not.toHaveBeenCalled();
});

it("does not display a fake zero if the catalog entry disappeared", async () => {
  mocks.size.mockResolvedValue(null);
  await expect(TablePage(props)).rejects.toThrow("not found");
});
