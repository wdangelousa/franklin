-- Migration: add_proposal_checklist_item
-- Run this script against your PostgreSQL database before deploying the app.
-- After running, execute: npx prisma generate

-- 1. Add new event type value (Postgres allows adding enum values)
ALTER TYPE "ProposalEventType" ADD VALUE IF NOT EXISTS 'CHECKLIST_ITEM_COMPLETED';

-- 2. Create ChecklistItemSide enum
DO $$ BEGIN
  CREATE TYPE "ChecklistItemSide" AS ENUM ('CLIENT', 'INTERNAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create ProposalChecklistItem table
CREATE TABLE IF NOT EXISTS "ProposalChecklistItem" (
  "id"          TEXT NOT NULL,
  "proposalId"  TEXT NOT NULL,
  "side"        "ChecklistItemSide" NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "completedBy" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProposalChecklistItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProposalChecklistItem_proposalId_fkey"
    FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProposalChecklistItem_proposalId_side_sortOrder_idx"
  ON "ProposalChecklistItem"("proposalId", "side", "sortOrder");
