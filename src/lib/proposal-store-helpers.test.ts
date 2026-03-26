import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/proposal-draft", () => ({
  getBillingTypeLabel: (t: string) => t
}));
vi.mock("@/lib/proposal-errors", () => {
  class ProposalError extends Error {
    readonly code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = "ProposalError";
    }
  }
  return { ProposalError };
});

import {
  createProposalNumber,
  buildPublicProposalSlug,
  slugify,
  addDays,
  normalizeQuantity
} from "./proposal-store-helpers";

describe("proposal-store-helpers", () => {
  describe("createProposalNumber", () => {
    it("should match FRK-YYYYMMDD-XXXXXX pattern", () => {
      const number = createProposalNumber();
      expect(number).toMatch(/^FRK-\d{8}-[0-9a-f]{6}$/);
    });

    it("should generate unique numbers", () => {
      const numbers = new Set(Array.from({ length: 100 }, () => createProposalNumber()));
      expect(numbers.size).toBe(100);
    });
  });

  describe("buildPublicProposalSlug", () => {
    it("should create a slug with company name and proposal number", () => {
      const slug = buildPublicProposalSlug("FRK-20260326-abc123", "Acme Corp");
      expect(slug).toMatch(/^acme-corp-frk-20260326-abc123$/);
    });

    it("should handle special characters in company name", () => {
      const slug = buildPublicProposalSlug("FRK-20260326-abc123", "Empresa & Cia Ltda.");
      expect(slug).toMatch(/^empresa-cia-ltda-frk/);
    });

    it("should not exceed 80 characters", () => {
      const longName = "A".repeat(100);
      const slug = buildPublicProposalSlug("FRK-20260326-abc123", longName);
      expect(slug.length).toBeLessThanOrEqual(80);
    });
  });

  describe("slugify", () => {
    it("should lowercase and replace non-alphanumeric chars with hyphens", () => {
      expect(slugify("Hello World!")).toBe("hello-world");
    });

    it("should trim leading and trailing hyphens", () => {
      expect(slugify("---test---")).toBe("test");
    });
  });

  describe("addDays", () => {
    it("should add days correctly", () => {
      const base = new Date("2026-03-01T00:00:00Z");
      const result = addDays(base, 14);
      expect(result.toISOString()).toBe("2026-03-15T00:00:00.000Z");
    });

    it("should not mutate the original date", () => {
      const base = new Date("2026-03-01T00:00:00Z");
      addDays(base, 14);
      expect(base.toISOString()).toBe("2026-03-01T00:00:00.000Z");
    });
  });

  describe("normalizeQuantity", () => {
    it("should return 1 for values below 1", () => {
      expect(normalizeQuantity(0)).toBe(1);
      expect(normalizeQuantity(-5)).toBe(1);
    });

    it("should floor fractional values", () => {
      expect(normalizeQuantity(3.7)).toBe(3);
    });

    it("should return 1 for NaN", () => {
      expect(normalizeQuantity(NaN)).toBe(1);
    });

    it("should pass through valid integers", () => {
      expect(normalizeQuantity(5)).toBe(5);
    });
  });
});
