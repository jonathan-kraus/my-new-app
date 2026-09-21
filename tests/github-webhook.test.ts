import { createHmac } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import contract from "../generated/prisma8/contract.json";

const mocks = vi.hoisted(() => ({
  where: vi.fn().mockReturnThis(),
  first: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  log: vi.fn(),
}));
vi.mock("@/lib/db.prisma8", () => ({
  db8: { orm: { public: { GithubEvent: mocks } } },
}));
vi.mock("@/lib/runtime/config", () => ({
  getConfig: vi.fn().mockResolvedValue(0),
}));
vi.mock("@/lib/log/logj", () => ({ logj: mocks.log }));
import { POST } from "../app/api/github-webhook/route";

const payload = {
  repository: { name: "my-new-app", full_name: "owner/my-new-app" },
  pull_request: {
    number: 123,
    title: "Dependency update",
    state: "open",
    user: { login: "renovate[bot]" },
    head: { sha: "abc123" },
  },
};
function request(event = "pull_request", data: unknown = payload) {
  const body = JSON.stringify(data);
  return new Request("https://www.kraus.my.id/api/github-webhook", {
    method: "POST",
    body,
    headers: {
      "x-github-event": event,
      "x-github-delivery": "delivery-123",
      "x-hub-signature-256":
        "sha256=" +
        createHmac("sha256", "test-secret").update(body).digest("hex"),
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("GITHUB_WEBHOOK_SECRET", "test-secret");
  mocks.first.mockResolvedValue(null);
  mocks.create.mockResolvedValue({});
  mocks.update.mockResolvedValue({});
  mocks.log.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllEnvs());

it.each([false, true])(
  "persists a pull request using only contract fields (existing=%s)",
  async (existing) => {
    mocks.first.mockResolvedValue(existing ? { id: "stored-123" } : null);
    expect((await POST(request())).status).toBe(200);
    const write = existing ? mocks.update : mocks.create;
    expect(write).toHaveBeenCalledOnce();
    const saved = write.mock.calls[0]![0];
    expect(saved).not.toHaveProperty("prNumber");
    expect(saved).not.toHaveProperty("type");
    expect(saved).toMatchObject({
      _type: "pull_request",
      repo: "owner/my-new-app",
      title: "Dependency update",
      raw: payload,
    });
    const allowed = Object.keys(
      contract.domain.namespaces.public.models.GithubEvent.fields,
    );
    expect(Object.keys(saved).filter((key) => !allowed.includes(key))).toEqual(
      [],
    );
    expect(saved.raw.pull_request.number).toBe(123);
  },
);

it.each([
  [
    "workflow_job",
    { workflow_job: { name: "build", conclusion: "success" } },
    { jobName: "build" },
  ],
  [
    "push",
    { head_commit: { message: "Fix logging" } },
    { commitMessage: "Fix logging" },
  ],
])(
  "keeps supported optional fields for %s",
  async (event, details, expected) => {
    await POST(
      request(String(event), {
        repository: payload.repository,
        ...(details as object),
      }),
    );
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining(expected),
    );
  },
);

it("rejects invalid signatures without writing", async () => {
  const req = request();
  req.headers.set("x-hub-signature-256", "invalid");
  expect((await POST(req)).status).toBe(401);
  expect(mocks.create).not.toHaveBeenCalled();
  expect(mocks.update).not.toHaveBeenCalled();
});

it("logs database failures and preserves the failure for webhook retries", async () => {
  mocks.create.mockRejectedValueOnce(new Error("database unavailable"));
  await expect(POST(request())).rejects.toThrow("database unavailable");
  expect(mocks.log).toHaveBeenCalledWith(
    expect.objectContaining({
      level: "error",
      message: "Github event database write failed",
      payload: expect.objectContaining({ deliveryId: "delivery-123" }),
    }),
  );
});
