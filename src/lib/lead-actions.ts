"use server";

import { redirect } from "next/navigation";

import { requireInternalSession } from "@/lib/auth/session";
import type { LeadSource } from "@/lib/lead-labels";
import { createLeadRecord, leadSourceOptions } from "@/lib/leads";

function getStringValue(input: FormDataEntryValue | null): string {
  if (typeof input !== "string") {
    return "";
  }

  return input.trim();
}

function parseLeadSource(input: FormDataEntryValue | null): LeadSource {
  if (typeof input !== "string") {
    return leadSourceOptions[0];
  }

  const normalized = input.trim();

  return leadSourceOptions.find((option) => option === normalized) ?? leadSourceOptions[0];
}

export async function createLeadDraft(formData: FormData): Promise<void> {
  const session = await requireInternalSession();

  const fullName = getStringValue(formData.get("fullName"));
  const company = getStringValue(formData.get("company"));
  const email = getStringValue(formData.get("email"));
  const phone = getStringValue(formData.get("phone"));
  const notes = getStringValue(formData.get("notes"));
  const assignedPartner = getStringValue(formData.get("assignedPartner"));
  const source = parseLeadSource(formData.get("source"));

  if (!fullName || !company || !email || !phone || !assignedPartner) {
    redirect("/app/leads/new?error=required_fields");
  }

  let createdLead: { id: string; fullName: string; company: string } | null = null;

  try {
    createdLead = await createLeadRecord({
      session,
      fullName,
      company,
      email,
      phone,
      source,
      assignedPartner,
      notes
    });
  } catch {
    redirect("/app/leads/new?error=create_failed");
  }

  if (!createdLead) {
    redirect("/app/leads/new?error=create_failed");
  }

  const searchParams = new URLSearchParams({
    created: "1",
    leadId: createdLead.id,
    fullName: createdLead.fullName,
    company: createdLead.company
  });

  redirect(`/app/leads?${searchParams.toString()}`);
}
