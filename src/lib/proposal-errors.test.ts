import { describe, it, expect } from "vitest";

import {
  ProposalError,
  isProposalError,
  getProposalErrorCode
} from "./proposal-errors";

describe("proposal-errors", () => {
  it("should create a ProposalError with stable code", () => {
    const error = new ProposalError("NO_SERVICES", "Test message");
    expect(error.code).toBe("NO_SERVICES");
    expect(error.message).toBe("Test message");
    expect(error.name).toBe("ProposalError");
  });

  it("isProposalError should return true for ProposalError instances", () => {
    const error = new ProposalError("TOKEN_NOT_FOUND", "not found");
    expect(isProposalError(error)).toBe(true);
  });

  it("isProposalError should return false for regular Error", () => {
    expect(isProposalError(new Error("test"))).toBe(false);
  });

  it("isProposalError should return false for non-error values", () => {
    expect(isProposalError("string")).toBe(false);
    expect(isProposalError(null)).toBe(false);
    expect(isProposalError(undefined)).toBe(false);
  });

  it("getProposalErrorCode should extract code from ProposalError", () => {
    const error = new ProposalError("TOKEN_EXPIRED", "expired");
    expect(getProposalErrorCode(error)).toBe("TOKEN_EXPIRED");
  });

  it("getProposalErrorCode should return null for regular Error", () => {
    expect(getProposalErrorCode(new Error("test"))).toBeNull();
  });

  it("ProposalError should be instanceof Error", () => {
    const error = new ProposalError("LEAD_INCOMPLETE", "incomplete");
    expect(error instanceof Error).toBe(true);
  });
});
