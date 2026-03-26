import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createProposalToken, hashProposalToken, decryptProposalToken } from "./proposal-token";

describe("proposal-token", () => {
  beforeEach(() => {
    vi.stubEnv("FRANKLIN_TOKEN_SECRET", "test-token-secret");
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("createProposalToken", () => {
    it("should generate a token with the frkpub prefix", () => {
      expect(createProposalToken().value).toMatch(/^frkpub_/);
    });

    it("should return a prefix of 16 characters", () => {
      const token = createProposalToken();
      expect(token.prefix).toHaveLength(16);
    });

    it("should return a SHA-256 hash (64 hex chars)", () => {
      expect(createProposalToken().hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("should return ciphertext in iv.authTag.encrypted format", () => {
      expect(createProposalToken().ciphertext.split(".")).toHaveLength(3);
    });

    it("should generate unique tokens", () => {
      const a = createProposalToken();
      const b = createProposalToken();
      expect(a.value).not.toBe(b.value);
    });
  });

  describe("hashProposalToken", () => {
    it("should produce deterministic hashes", () => {
      expect(hashProposalToken("frkpub_abc")).toBe(hashProposalToken("frkpub_abc"));
    });

    it("should produce different hashes for different tokens", () => {
      expect(hashProposalToken("frkpub_abc")).not.toBe(hashProposalToken("frkpub_xyz"));
    });
  });

  describe("decryptProposalToken", () => {
    it("should decrypt a valid ciphertext", () => {
      const token = createProposalToken();
      expect(decryptProposalToken(token.ciphertext)).toBe(token.value);
    });

    it("should return null for null input", () => {
      expect(decryptProposalToken(null)).toBeNull();
    });

    it("should return null for malformed ciphertext", () => {
      expect(decryptProposalToken("not-valid")).toBeNull();
    });
  });

  describe("secret rotation", () => {
    it("should decrypt token encrypted with previous secret", () => {
      const token = createProposalToken();

      // Rotate: old becomes PREVIOUS, new becomes primary
      vi.stubEnv("FRANKLIN_TOKEN_SECRET_PREVIOUS", "test-token-secret");
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "new-token-secret");

      expect(decryptProposalToken(token.ciphertext)).toBe(token.value);
    });

    it("should fail after previous secret is removed", () => {
      const token = createProposalToken();

      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "completely-different-secret");
      // No PREVIOUS set
      expect(decryptProposalToken(token.ciphertext)).toBeNull();
    });
  });

  describe("production secret requirement", () => {
    it("should throw in production without secret", () => {
      vi.unstubAllEnvs();
      vi.stubEnv("NODE_ENV", "production");
      expect(() => createProposalToken()).toThrow(/must be set in production/);
    });
  });
});
