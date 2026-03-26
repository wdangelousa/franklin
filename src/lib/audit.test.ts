import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { audit, auditContext } from "./audit";

describe("audit", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("should emit a JSON log with timestamp", () => {
    audit({
      event: "auth.login.success",
      actorType: "user",
      actorId: "test-user",
      outcome: "success"
    });

    expect(logSpy).toHaveBeenCalledOnce();
    const output = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(output.event).toBe("auth.login.success");
    expect(output.actorId).toBe("test-user");
    expect(output.timestamp).toBeDefined();
  });

  it("should truncate long token prefixes", () => {
    audit({
      event: "public.token.invalid",
      actorType: "anonymous",
      outcome: "denied",
      tokenPrefix: "frkpub_a1b2c3d4e5f6g7h8i9j0k1l2m3n4"
    });

    const output = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(output.tokenPrefix.length).toBeLessThanOrEqual(20);
  });

  it("should include meta fields", () => {
    audit({
      event: "public.checklist.completed",
      actorType: "anonymous",
      outcome: "success",
      meta: { itemId: "item-123", side: "CLIENT" }
    });

    const output = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(output.meta.itemId).toBe("item-123");
  });

  it("should not include undefined fields", () => {
    audit({
      event: "auth.logout",
      actorType: "user",
      outcome: "success"
    });

    const raw = logSpy.mock.calls[0][0] as string;
    expect(raw).not.toContain("proposalId");
  });
});

describe("auditContext", () => {
  it("should truncate long user-agent strings", () => {
    const ctx = auditContext({
      ip: "1.2.3.4",
      userAgent: "A".repeat(500),
      route: "/test"
    });

    expect(ctx.userAgent!.length).toBe(256);
  });

  it("should return provided fields", () => {
    const ctx = auditContext({ ip: "1.2.3.4", route: "/test" });
    expect(ctx.ip).toBe("1.2.3.4");
    expect(ctx.route).toBe("/test");
  });
});
