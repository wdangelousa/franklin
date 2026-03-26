import { describe, it, expect, beforeEach } from "vitest";

import { checkRateLimit, resetRateLimitStore, type RateLimitConfig } from "./rate-limit";

describe("rate-limit", () => {
  const config: RateLimitConfig = { maxRequests: 3, windowMs: 10_000 };

  beforeEach(() => {
    resetRateLimitStore(); // Fresh in-memory store each test
  });

  it("should allow requests under the limit", async () => {
    const key = `test-allow-${Date.now()}`;
    const r = await checkRateLimit(key, config);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("should block requests over the limit", async () => {
    const key = `test-block-${Date.now()}`;
    await checkRateLimit(key, config);
    await checkRateLimit(key, config);
    await checkRateLimit(key, config);

    const r4 = await checkRateLimit(key, config);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("should track remaining count correctly", async () => {
    const key = `test-remain-${Date.now()}`;
    expect((await checkRateLimit(key, config)).remaining).toBe(2);
    expect((await checkRateLimit(key, config)).remaining).toBe(1);
    expect((await checkRateLimit(key, config)).remaining).toBe(0);
  });

  it("should isolate different keys", async () => {
    const ts = Date.now();
    const keyA = `test-a-${ts}`;
    const keyB = `test-b-${ts}`;

    await checkRateLimit(keyA, config);
    await checkRateLimit(keyA, config);
    await checkRateLimit(keyA, config);

    const rB = await checkRateLimit(keyB, config);
    expect(rB.allowed).toBe(true);
  });

  it("should return resetAt in the future", async () => {
    const key = `test-reset-${Date.now()}`;
    const r = await checkRateLimit(key, config);
    expect(r.resetAt).toBeGreaterThan(Date.now());
  });

  it("should fail-open when backend is unavailable", async () => {
    // Inject a broken store
    const brokenStore = {
      async get() { throw new Error("connection refused"); },
      async increment() { throw new Error("connection refused"); }
    };
    resetRateLimitStore(brokenStore);

    const r = await checkRateLimit("broken-key", config);
    expect(r.allowed).toBe(true); // fail-open
  });
});
