import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Resend as ResendClient } from "resend";

const mocks = vi.hoisted(() => ({ get: vi.fn(), log: vi.fn() }));
vi.mock("@/lib/log/logj", () => ({ logj: mocks.log }));
vi.mock("resend", async () => {
  const actual = await vi.importActual<{ Resend: typeof ResendClient }>(
    "resend",
  );
  return {
    ...actual,
    Resend: class extends actual.Resend {
      constructor(key?: string) {
        super(key);
        this.emails.receiving.get = mocks.get;
      }
    },
  };
});
import { POST } from "../app/api/webhook/route";

const key = Buffer.from("test-signing-key-for-resend-webhook");
const secret = `whsec_${key.toString("base64")}`;
const event = {
  type: "email.received",
  created_at: "2026-09-21T12:00:00Z",
  data: { email_id: "email-123", from: "sender@example.com" },
};

function request(
  payload = JSON.stringify(event),
  seconds = Math.floor(Date.now() / 1000),
) {
  const id = "msg_test_delivery";
  const timestamp = String(seconds);
  const signature = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${payload}`)
    .digest("base64");
  return new Request("https://kraus.my.id/api/webhook", {
    method: "POST",
    body: payload,
    headers: {
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": `v1,${signature}`,
    },
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("RESEND_WEBHOOK_SECRET", secret);
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  mocks.get.mockResolvedValue({
    data: {
      from: "sender@example.com",
      subject: "Test subject",
      html: "private-html-body",
      text: "private-text-body",
      attachments: [],
    },
    error: null,
  });
  mocks.log.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllEnvs());

describe("Resend webhook", () => {
  it("verifies a real signature, retrieves the email, and uses logj", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(mocks.get).toHaveBeenCalledWith("email-123");
    expect(mocks.log).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: "resend",
        level: "info",
        message: "Received email via Resend",
        payload: expect.objectContaining({
          emailId: "email-123",
          from: "sender@example.com",
          subject: "Test subject",
          hasText: true,
          hasHtml: true,
        }),
        meta: expect.objectContaining({
          requestId: "msg_test_delivery",
          built: expect.objectContaining({
            requestId: "msg_test_delivery",
            eventIndex: 1,
            route: "resend-webhook",
          }),
        }),
      }),
    );
    const logged = JSON.stringify(mocks.log.mock.calls);
    expect(logged).not.toContain("private-html-body");
    expect(logged).not.toContain("private-text-body");
    expect(logged).not.toContain(secret);
  });

  it.each(["svix-id", "svix-timestamp", "svix-signature"])(
    "rejects a missing %s",
    async (header) => {
      const req = request();
      req.headers.delete(header);
      expect((await POST(req)).status).toBe(400);
      expect(mocks.get).not.toHaveBeenCalled();
    },
  );

  it("rejects a forged signature before retrieving email", async () => {
    const req = request();
    req.headers.set("svix-signature", "v1,invalid");
    expect((await POST(req)).status).toBe(400);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("verifies raw bytes rather than reserialized JSON", async () => {
    const body = JSON.stringify(event, null, 2);
    expect((await POST(request(body))).status).toBe(200);
    mocks.get.mockClear();
    const signed = request(body);
    const tampered = new Request(signed.url, {
      method: "POST",
      headers: signed.headers,
      body: body + " ",
    });
    expect((await POST(tampered)).status).toBe(400);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("rejects expired signatures", async () => {
    expect(
      (await POST(request(undefined, Math.floor(Date.now() / 1000) - 3600)))
        .status,
    ).toBe(400);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it.each(["RESEND_WEBHOOK_SECRET", "RESEND_API_KEY"])(
    "fails closed when %s is missing",
    async (name) => {
      vi.stubEnv(name, "");
      expect((await POST(request())).status).toBe(500);
      expect(mocks.get).not.toHaveBeenCalled();
    },
  );

  it("acknowledges other signed event types without fetching email", async () => {
    const res = await POST(
      request(JSON.stringify({ ...event, type: "contact.created" })),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true, ignored: true });
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("rejects received events without an email ID", async () => {
    expect(
      (await POST(request(JSON.stringify({ ...event, data: {} })))).status,
    ).toBe(400);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("returns a retryable failure when Resend cannot retrieve the email", async () => {
    mocks.get.mockResolvedValue({
      data: null,
      error: { name: "rate_limit_exceeded", message: "upstream details" },
    });
    expect((await POST(request())).status).toBe(502);
    expect(mocks.log).toHaveBeenCalledWith(
      expect.objectContaining({ level: "error" }),
    );
    expect(JSON.stringify(mocks.log.mock.calls)).not.toContain(
      "upstream details",
    );
  });

  it("returns a retryable failure on network errors", async () => {
    mocks.get.mockRejectedValue(new Error("connection failed"));
    expect((await POST(request())).status).toBe(500);
  });

  it.each([
    ["email.sent", "info"],
    ["email.delivered", "info"],
    ["email.scheduled", "info"],
    ["email.bounced", "error"],
    ["email.failed", "error"],
    ["email.delivery_delayed", "warn"],
    ["email.complained", "warn"],
    ["email.suppressed", "warn"],
    ["email.opened", "info"],
    ["email.clicked", "info"],
  ])(
    "logs outbound %s without fetching an inbound email",
    async (type, level) => {
      const data = {
        email_id: "outbound-123",
        from: "my-new-app <dbemail@kraus.my.id>",
        to: ["recipient@outlook.com"],
        subject: "Database report",
        html: "do-not-log-body",
      };
      const res = await POST(request(JSON.stringify({ ...event, type, data })));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ received: true });
      expect(mocks.get).not.toHaveBeenCalled();
      expect(mocks.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level,
          message: `Resend ${type}`,
          payload: expect.objectContaining({
            emailId: "outbound-123",
            eventType: type,
            to: ["recipient@outlook.com"],
          }),
          meta: expect.objectContaining({
            requestId: "msg_test_delivery",
            built: expect.objectContaining({
              eventIndex: 1,
              requestId: "msg_test_delivery",
            }),
          }),
        }),
      );
      expect(JSON.stringify(mocks.log.mock.calls)).not.toContain(
        "do-not-log-body",
      );
    },
  );

  it("keeps useful bounce reasons in the log", async () => {
    const bounce = {
      type: "Permanent",
      subType: "General",
      message: "Mailbox unavailable",
    };
    await POST(
      request(
        JSON.stringify({
          ...event,
          type: "email.bounced",
          data: {
            ...event.data,
            to: ["recipient@outlook.com"],
            subject: "Report",
            bounce,
          },
        }),
      ),
    );
    expect(mocks.log).toHaveBeenCalledWith(
      expect.objectContaining({ payload: expect.objectContaining({ bounce }) }),
    );
  });

  it("rejects malformed outbound metadata before logging success", async () => {
    const res = await POST(
      request(JSON.stringify({ ...event, type: "email.delivered", data: {} })),
    );
    expect(res.status).toBe(400);
    expect(mocks.get).not.toHaveBeenCalled();
    expect(mocks.log).toHaveBeenCalledWith(
      expect.objectContaining({ level: "warn" }),
    );
  });
});
