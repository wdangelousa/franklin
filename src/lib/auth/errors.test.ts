import { describe, it, expect } from "vitest";

import { AuthError, isAuthError } from "./errors";

describe("auth errors", () => {
  it("should create an AuthError with stable code", () => {
    const error = new AuthError("DEMO_LOGIN_DISABLED_IN_STRICT_MODE", "demo disabled");
    expect(error.code).toBe("DEMO_LOGIN_DISABLED_IN_STRICT_MODE");
    expect(error.message).toBe("demo disabled");
    expect(error.name).toBe("AuthError");
  });

  it("isAuthError should identify AuthError instances", () => {
    const error = new AuthError("INVALID_SESSION", "bad session");
    expect(isAuthError(error)).toBe(true);
  });

  it("isAuthError should return false for regular errors", () => {
    expect(isAuthError(new Error("test"))).toBe(false);
    expect(isAuthError("string")).toBe(false);
    expect(isAuthError(null)).toBe(false);
  });

  it("AuthError should be instanceof Error", () => {
    const error = new AuthError("SESSION_SECRET_MISSING", "no secret");
    expect(error instanceof Error).toBe(true);
  });
});
