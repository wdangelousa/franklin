import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/brand", () => ({ brand: { organizationName: "Test Org" } }));

describe("auth config", () => {
  it("should resolve AUTH_MODE from FRANKLIN_AUTH_MODE", async () => {
    vi.stubEnv("FRANKLIN_AUTH_MODE", "strict");
    vi.resetModules();
    const config = await import("./config");
    expect(config.AUTH_MODE).toBe("strict");
    vi.unstubAllEnvs();
  });

  it("should default to mock when FRANKLIN_AUTH_MODE is not set", async () => {
    vi.stubEnv("FRANKLIN_AUTH_MODE", "");
    vi.resetModules();
    const config = await import("./config");
    expect(config.AUTH_MODE).toBe("mock");
    vi.unstubAllEnvs();
  });

  it("isDemoLoginAllowed should return false in strict mode", async () => {
    vi.stubEnv("FRANKLIN_AUTH_MODE", "strict");
    vi.resetModules();
    const config = await import("./config");
    expect(config.isDemoLoginAllowed()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("isDemoLoginAllowed should return true in mock mode", async () => {
    vi.stubEnv("FRANKLIN_AUTH_MODE", "mock");
    vi.resetModules();
    const config = await import("./config");
    expect(config.isDemoLoginAllowed()).toBe(true);
    vi.unstubAllEnvs();
  });
});
