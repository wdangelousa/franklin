import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

import { signSessionPayload } from "./session-crypto";
import { verifySessionPayloadEdge } from "./session-verify-edge";

describe("session-verify-edge", () => {
  beforeEach(() => {
    vi.stubEnv("FRANKLIN_TOKEN_SECRET", "test-secret-for-edge");
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should verify a payload signed by the Node.js signer", async () => {
    const payload = JSON.stringify({ mode: "mock", user: { id: "test" } });
    const signed = signSessionPayload(payload);
    expect(await verifySessionPayloadEdge(signed)).toBe(payload);
  });

  it("should reject a tampered payload", async () => {
    const signed = signSessionPayload("test");
    const [ep, sig] = signed.split(".");
    expect(await verifySessionPayloadEdge(`${ep}x.${sig}`)).toBeNull();
  });

  it("should reject a tampered signature", async () => {
    const signed = signSessionPayload("test");
    const [ep, sig] = signed.split(".");
    expect(await verifySessionPayloadEdge(`${ep}.${sig}x`)).toBeNull();
  });

  it("should reject malformed input", async () => {
    expect(await verifySessionPayloadEdge("")).toBeNull();
    expect(await verifySessionPayloadEdge("nodot")).toBeNull();
    expect(await verifySessionPayloadEdge(".empty")).toBeNull();
  });

  describe("secret rotation", () => {
    it("should verify payload signed with previous secret", async () => {
      const payload = "edge-rotation-test";
      const signed = signSessionPayload(payload);

      vi.stubEnv("FRANKLIN_SESSION_SECRET_PREVIOUS", "test-secret-for-edge");
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "new-edge-primary");

      expect(await verifySessionPayloadEdge(signed)).toBe(payload);
    });
  });
});
