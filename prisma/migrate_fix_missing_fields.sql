-- Migration: fix_missing_fields
-- Adds fields to ProposalItem and Proposal that were missing.
-- Run after migrate_add_checklist.sql.

-- 1. Add new fields to ProposalItem
ALTER TABLE "ProposalItem" ADD COLUMN IF NOT EXISTS "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE "ProposalItem" ADD COLUMN IF NOT EXISTS "deliveryTimeframe" TEXT;
ALTER TABLE "ProposalItem" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "ProposalItem" ADD COLUMN IF NOT EXISTS "deliverablesSnapshot" JSONB;

-- 2. Add expiredAt to Proposal
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "expiredAt" TIMESTAMP(3);

-- 3. Add performance index on Proposal
CREATE INDEX IF NOT EXISTS "Proposal_organizationId_status_expiresAt_idx"
  ON "Proposal"("organizationId", "status", "expiresAt");
