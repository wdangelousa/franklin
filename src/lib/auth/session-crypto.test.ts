import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

import { signSessionPayload, verifySessionPayload } from "./session-crypto";

describe("session-crypto", () => {
  beforeEach(() => {
    vi.stubEnv("FRANKLIN_TOKEN_SECRET", "test-secret-for-signing");
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("sign + verify roundtrip", () => {
    it("should sign and verify a valid payload", () => {
      const payload = JSON.stringify({ mode: "mock", user: { id: "test" } });
      const signed = signSessionPayload(payload);
      expect(signed).toContain(".");
      expect(verifySessionPayload(signed)).toBe(payload);
    });

    it("should reject a tampered payload", () => {
      const signed = signSessionPayload("test");
      const [ep, sig] = signed.split(".");
      expect(verifySessionPayload(`${ep}x.${sig}`)).toBeNull();
    });

    it("should reject a tampered signature", () => {
      const signed = signSessionPayload("test");
      const [ep, sig] = signed.split(".");
      expect(verifySessionPayload(`${ep}.${sig}x`)).toBeNull();
    });

    it("should reject malformed input", () => {
      expect(verifySessionPayload("nodot")).toBeNull();
      expect(verifySessionPayload(".sig")).toBeNull();
      expect(verifySessionPayload("payload.")).toBeNull();
      expect(verifySessionPayload("")).toBeNull();
    });
  });

  describe("secret rotation", () => {
    it("should verify payload signed with old secret after rotation", () => {
      // Sign with current secret
      const payload = "rotation-test";
      const signed = signSessionPayload(payload);

      // Rotate: old secret becomes PREVIOUS, new secret becomes primary
      vi.stubEnv("FRANKLIN_SESSION_SECRET_PREVIOUS", "test-secret-for-signing");
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "new-primary-secret");

      // Should still verify with the previous secret
      expect(verifySessionPayload(signed)).toBe(payload);
    });

    it("should sign with new primary after rotation", () => {
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "new-primary-secret");

      const payload = "new-secret-test";
      const signed = signSessionPayload(payload);

      // Verify works with new primary
      expect(verifySessionPayload(signed)).toBe(payload);

      // Would fail with only old secret
      vi.unstubAllEnvs();
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "old-secret");
      vi.stubEnv("NODE_ENV", "test");
      expect(verifySessionPayload(signed)).toBeNull();
    });

    it("should reject after previous secret is removed", () => {
      const payload = "expire-test";
      const signed = signSessionPayload(payload);

      // Change primary, no previous
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "completely-new-secret");
      expect(verifySessionPayload(signed)).toBeNull();
    });
  });

  describe("production secret requirement", () => {
    it("should throw when signing in production without secret", () => {
      vi.unstubAllEnvs();
      vi.stubEnv("NODE_ENV", "production");
      expect(() => signSessionPayload("test")).toThrow(/must be set in production/);
    });
  });
});
