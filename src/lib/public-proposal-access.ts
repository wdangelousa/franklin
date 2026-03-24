import "server-only";

import {
  buildPublicProposalSnapshotFromRecord,
  getPublicProposalRecordByToken
} from "@/lib/proposal-store";
import {
  mapProposalEventsToWorkflowEventLog,
  resolvePublicProposal,
  type ResolvedPublicProposal
} from "@/lib/public-proposals";

export async function getResolvedPublicProposalByToken(
  token: string,
  options?: {
    recordView?: boolean;
  }
): Promise<ResolvedPublicProposal | null> {
  const proposal = await getPublicProposalRecordByToken({
    token,
    recordView: options?.recordView
  });

  if (!proposal) {
    return null;
  }

  const snapshot = buildPublicProposalSnapshotFromRecord(proposal);

  if (!snapshot.token) {
    return null;
  }

  return resolvePublicProposal(
    {
      token: snapshot.token,
      legacySlug: snapshot.legacySlug,
      proposalNumber: snapshot.proposalNumber,
      title: snapshot.title,
      coverTagline: snapshot.content.coverTagline,
      status: snapshot.status,
      companyName: snapshot.companyName,
      contactName: snapshot.contactName,
      contactTitle: snapshot.contactTitle,
      contactEmail: snapshot.contactEmail,
      draftedAt: snapshot.draftedAt,
      preparedAt: snapshot.preparedAt,
      sentAt: snapshot.sentAt,
      expiresAt: snapshot.expiresAt,
      acceptedAt: snapshot.acceptedAt,
      cancelledAt: snapshot.cancelledAt,
      onebridgeInstitutionalPresentation: snapshot.content.onebridgeInstitutionalPresentation,
      proposalIntroduction: snapshot.content.proposalIntroduction,
      selectedServices: snapshot.selectedServices,
      specificTerms: snapshot.content.specificTerms,
      investmentIntro: snapshot.content.investmentIntro,
      requiredDocuments: snapshot.content.requiredDocuments,
      documentSubmissionInstructions: snapshot.content.documentSubmissionInstructions,
      generalTerms: snapshot.content.generalTerms,
      acceptanceText: snapshot.content.acceptanceText,
      paymentIntro: snapshot.content.paymentIntro,
      closingParagraph: snapshot.content.closingParagraph
    },
    mapProposalEventsToWorkflowEventLog(snapshot.eventLog)
  );
}
