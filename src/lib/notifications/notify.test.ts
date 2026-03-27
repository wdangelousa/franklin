import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/notifications/email/mailersend", () => ({
  sendEmail: vi.fn().mockResolvedValue({ channel: "email", status: "sent", providerMessageId: "mock-id" })
}));

vi.mock("@/lib/audit", () => ({
  audit: vi.fn()
}));

import { notifyProposalPublished, notifyProposalAccepted, notifyProposalRejected, notifyProposalExpiringSoon } from "./notify";
import { sendEmail } from "@/lib/notifications/email/mailersend";

describe("notify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("notifyProposalPublished", () => {
    it("should send email when clientEmail is provided", async () => {
      const results = await notifyProposalPublished({
        proposalId: "p1",
        proposalNumber: "FRK-20260326-abc123",
        clientName: "John",
        clientEmail: "john@example.com",
        companyName: "Acme",
        publicLink: "http://localhost:3000/p/frkpub_test",
        expiresAt: new Date("2026-04-09"),
        publishedByName: "Walter"
      });

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe("sent");
      expect(sendEmail).toHaveBeenCalledOnce();
      expect(vi.mocked(sendEmail).mock.calls[0][0].to).toBe("john@example.com");
      expect(vi.mocked(sendEmail).mock.calls[0][0].templateKey).toBe("proposal_published");
    });

    it("should not send email when clientEmail is null", async () => {
      const results = await notifyProposalPublished({
        proposalId: "p1",
        proposalNumber: "FRK-20260326-abc123",
        clientName: "John",
        clientEmail: null,
        companyName: "Acme",
        publicLink: "http://localhost:3000/p/frkpub_test",
        expiresAt: new Date("2026-04-09"),
        publishedByName: "Walter"
      });

      expect(results).toHaveLength(0);
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe("notifyProposalAccepted", () => {
    it("should send to internal recipient when provided", async () => {
      const results = await notifyProposalAccepted(
        {
          proposalId: "p1",
          proposalNumber: "FRK-20260326-abc123",
          clientName: "John",
          clientEmail: "john@example.com",
          companyName: "Acme",
          acceptedAt: new Date()
        },
        "admin@onebridge.com"
      );

      expect(results).toHaveLength(1);
      expect(vi.mocked(sendEmail).mock.calls[0][0].to).toBe("admin@onebridge.com");
      expect(vi.mocked(sendEmail).mock.calls[0][0].templateKey).toBe("proposal_accepted");
    });

    it("should return empty when no internal recipient", async () => {
      const results = await notifyProposalAccepted({
        proposalId: "p1",
        proposalNumber: "FRK-20260326-abc123",
        clientName: "John",
        clientEmail: null,
        companyName: "Acme",
        acceptedAt: new Date()
      });

      expect(results).toHaveLength(0);
    });
  });

  describe("notifyProposalRejected", () => {
    it("should send to internal recipient", async () => {
      const results = await notifyProposalRejected(
        {
          proposalId: "p1",
          proposalNumber: "FRK-20260326-abc123",
          clientName: "John",
          clientEmail: null,
          companyName: "Acme",
          rejectedAt: new Date(),
          rejectedReason: "Budget"
        },
        "admin@onebridge.com"
      );

      expect(results).toHaveLength(1);
      expect(vi.mocked(sendEmail).mock.calls[0][0].templateKey).toBe("proposal_rejected");
    });
  });

  describe("notifyProposalExpiringSoon", () => {
    it("should return empty (not implemented yet)", async () => {
      const results = await notifyProposalExpiringSoon({
        proposalId: "p1",
        proposalNumber: "FRK-20260326-abc123",
        clientName: "John",
        clientEmail: "john@example.com",
        companyName: "Acme",
        expiresAt: new Date()
      });

      expect(results).toHaveLength(0);
    });
  });
});
