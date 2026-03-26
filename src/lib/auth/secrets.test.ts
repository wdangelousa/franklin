import { describe, it, expect, vi, afterEach } from "vitest";

import { getSessionSecrets, getTokenSecrets } from "./secrets";

describe("secrets", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getSessionSecrets", () => {
    it("should return primary from FRANKLIN_SESSION_SECRET", () => {
      vi.stubEnv("FRANKLIN_SESSION_SECRET", "session-key");
      vi.stubEnv("NODE_ENV", "test");
      const { primary } = getSessionSecrets();
      expect(primary).toBe("session-key");
    });

    it("should fall back to FRANKLIN_TOKEN_SECRET", () => {
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "token-key");
      vi.stubEnv("NODE_ENV", "test");
      const { primary } = getSessionSecrets();
      expect(primary).toBe("token-key");
    });

    it("should return previous when set", () => {
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "primary");
      vi.stubEnv("FRANKLIN_SESSION_SECRET_PREVIOUS", "old-session-key");
      vi.stubEnv("NODE_ENV", "test");
      const { previous } = getSessionSecrets();
      expect(previous).toBe("old-session-key");
    });

    it("should return null for previous when not set", () => {
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "primary");
      vi.stubEnv("NODE_ENV", "test");
      const { previous } = getSessionSecrets();
      expect(previous).toBeNull();
    });

    it("should throw in production without secret", () => {
      vi.stubEnv("NODE_ENV", "production");
      expect(() => getSessionSecrets()).toThrow(/must be set in production/);
    });

    it("should use dev fallback in non-production", () => {
      vi.stubEnv("NODE_ENV", "test");
      const { primary } = getSessionSecrets();
      expect(primary).toBe("franklin-dev-session-secret");
    });
  });

  describe("getTokenSecrets", () => {
    it("should return primary from FRANKLIN_TOKEN_SECRET", () => {
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "token-key");
      vi.stubEnv("NODE_ENV", "test");
      expect(getTokenSecrets().primary).toBe("token-key");
    });

    it("should return previous when set", () => {
      vi.stubEnv("FRANKLIN_TOKEN_SECRET", "new");
      vi.stubEnv("FRANKLIN_TOKEN_SECRET_PREVIOUS", "old");
      vi.stubEnv("NODE_ENV", "test");
      expect(getTokenSecrets().previous).toBe("old");
    });

    it("should throw in production without secret", () => {
      vi.stubEnv("NODE_ENV", "production");
      expect(() => getTokenSecrets()).toThrow(/must be set in production/);
    });
  });
});
